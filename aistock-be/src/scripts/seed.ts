import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

// 以下常量是可重复导入的演示知识库数据源。
const companies = [
  { stockCode: '300750', name: '宁德时代新能源科技股份有限公司', shortName: '宁德时代', exchange: 'SZSE', sector: '电池', tags: ['动力电池', '储能', '新能源'], products: [['动力电池系统', 70.2], ['储能系统', 18.4], ['电池材料及回收', 11.4]], description: '新能源动力电池及储能系统示例数据。' },
  { stockCode: '002594', name: '比亚迪股份有限公司', shortName: '比亚迪', exchange: 'SZSE', sector: '汽车整车', tags: ['新能源汽车', '动力电池', '智能驾驶'], products: [['新能源汽车', 72.8], ['手机部件及组装', 18.1], ['二次充电电池', 9.1]], description: '新能源汽车、电子和电池业务示例数据。' },
  { stockCode: '688981', name: '中芯国际集成电路制造有限公司', shortName: '中芯国际', exchange: 'SSE', sector: '半导体', tags: ['晶圆代工', '国产替代'], products: [['晶圆代工', 91.5], ['技术服务及其他', 8.5]], description: '集成电路晶圆代工与配套服务示例数据。' },
  { stockCode: '601012', name: '隆基绿能科技股份有限公司', shortName: '隆基绿能', exchange: 'SSE', sector: '光伏设备', tags: ['光伏', '绿色能源'], products: [['硅片及硅棒', 38.4], ['电池组件', 52.7], ['电站建设及服务', 8.9]], description: '光伏材料、组件和能源解决方案示例数据。' },
  { stockCode: '002230', name: '科大讯飞股份有限公司', shortName: '科大讯飞', exchange: 'SZSE', sector: '软件开发', tags: ['人工智能', '大模型', '教育信息化'], products: [['开放平台及消费者业务', 44.3], ['智慧教育', 28.6], ['智慧城市及其他', 27.1]], description: '人工智能技术、行业应用和智能产品示例数据。' },
  { stockCode: '600519', name: '贵州茅台酒股份有限公司', shortName: '贵州茅台', exchange: 'SSE', sector: '白酒', tags: ['消费龙头', '高端白酒'], products: [['茅台酒', 86.2], ['系列酒', 13.8]], description: '白酒生产和销售业务示例数据。' },
  { stockCode: '600036', name: '招商银行股份有限公司', shortName: '招商银行', exchange: 'SSE', sector: '股份制银行', tags: ['零售银行', '金融科技'], products: [['零售金融', 55.6], ['公司金融', 30.1], ['金融市场业务', 14.3]], description: '商业银行综合金融服务示例数据。' },
  { stockCode: '600276', name: '江苏恒瑞医药股份有限公司', shortName: '恒瑞医药', exchange: 'SSE', sector: '化学制药', tags: ['创新药', '医药研发'], products: [['抗肿瘤药物', 52.5], ['麻醉类药物', 18.2], ['造影剂及其他', 29.3]], description: '创新药研发、生产和销售示例数据。' },
];

const sectorGroups = [
  { name: '新能源', type: 'industry', children: ['电池', '光伏设备'] },
  { name: '信息技术', type: 'industry', children: ['半导体', '软件开发'] },
  { name: '大消费', type: 'industry', children: ['白酒'] },
  { name: '金融', type: 'industry', children: ['股份制银行'] },
  { name: '医药生物', type: 'industry', children: ['化学制药'] },
  { name: '汽车', type: 'industry', children: ['汽车整车'] },
];

const chainSeeds = [
  { name: '新能源汽车产业链', description: '从上游资源、电池材料到整车和充换电服务。', nodes: [
    ['锂矿与资源', 'material', 'upstream', 80, 150, []],
    ['动力电池', 'product', 'midstream', 360, 80, ['300750', '002594']],
    ['汽车零部件', 'stage', 'midstream', 360, 230, []],
    ['新能源汽车整车', 'company', 'downstream', 680, 150, ['002594']],
  ], edges: [[0, 1, '材料供应'], [1, 3, '电池配套'], [2, 3, '零部件配套']] },
  { name: '半导体产业链', description: '覆盖设计、制造、封装测试和终端应用。', nodes: [
    ['芯片设计', 'stage', 'upstream', 80, 150, []],
    ['晶圆制造', 'stage', 'midstream', 360, 150, ['688981']],
    ['封装测试', 'stage', 'midstream', 600, 70, []],
    ['终端应用', 'product', 'downstream', 600, 230, ['002230']],
  ], edges: [[0, 1, '设计流片'], [1, 2, '晶圆交付'], [1, 3, '芯片供应']] },
  { name: '光伏产业链', description: '覆盖硅料、硅片、电池组件和电站运营。', nodes: [
    ['硅料', 'material', 'upstream', 80, 150, []],
    ['硅片与电池片', 'product', 'midstream', 340, 150, ['601012']],
    ['光伏组件', 'product', 'midstream', 580, 150, ['601012']],
    ['光伏电站', 'stage', 'downstream', 820, 150, []],
  ], edges: [[0, 1, '原料供应'], [1, 2, '电池加工'], [2, 3, '组件安装']] },
];

/** 以 upsert 为主导入演示数据，重复执行不会无限产生重复记录。 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('缺少 DATABASE_URL');
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });

  try {
    // 清理早期版本使用 DEMO- 前缀创建的旧公司，保留用户自行录入的数据。
    const removed = await prisma.company.deleteMany({ where: { stockCode: { startsWith: 'DEMO-' } } });
    const sectorIds = new Map<string, number>();
    for (const group of sectorGroups) {
      const parent = await prisma.sector.upsert({ where: { name: group.name }, update: { type: group.type }, create: { name: group.name, type: group.type } });
      sectorIds.set(group.name, parent.id);
      for (const childName of group.children) {
        const child = await prisma.sector.upsert({ where: { name: childName }, update: { type: group.type, parentId: parent.id }, create: { name: childName, type: group.type, parentId: parent.id } });
        sectorIds.set(childName, child.id);
      }
    }

    const companyIds = new Map<string, number>();
    for (const data of companies) {
      const { sector, tags, products, ...companyData } = data;
      const company = await prisma.company.upsert({ where: { stockCode: data.stockCode }, update: { ...companyData, status: 'PUBLISHED' }, create: { ...companyData, status: 'PUBLISHED' } });
      companyIds.set(data.stockCode, company.id);
      const sectorId = sectorIds.get(sector)!;
      await prisma.companySector.upsert({ where: { companyId_sectorId: { companyId: company.id, sectorId } }, update: {}, create: { companyId: company.id, sectorId } });
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName, color: '#56d6ff' } });
        await prisma.companyTag.upsert({ where: { companyId_tagId: { companyId: company.id, tagId: tag.id } }, update: {}, create: { companyId: company.id, tagId: tag.id } });
      }
      for (const [name, revenueRate] of products) {
        const existing = await prisma.product.findFirst({ where: { companyId: company.id, name: String(name) } });
        const productData = { name: String(name), revenueRate: Number(revenueRate), description: `${data.shortName}主营业务演示数据` };
        if (existing) await prisma.product.update({ where: { id: existing.id }, data: productData });
        else await prisma.product.create({ data: { ...productData, companyId: company.id } });
      }
    }

    const chainIds = new Map<string, number>();
    for (const chainSeed of chainSeeds) {
      const chain = await prisma.industryChain.upsert({ where: { name: chainSeed.name }, update: { description: chainSeed.description, status: 'PUBLISHED' }, create: { name: chainSeed.name, description: chainSeed.description, status: 'PUBLISHED' } });
      chainIds.set(chain.name, chain.id);
      await prisma.industryChainEdge.deleteMany({ where: { chainId: chain.id } });
      await prisma.industryChainNode.deleteMany({ where: { chainId: chain.id } });
      const nodeIds: number[] = [];
      for (const node of chainSeed.nodes) {
        const codes = node[5] as string[];
        const created = await prisma.industryChainNode.create({ data: { chainId: chain.id, name: String(node[0]), type: String(node[1]), stage: String(node[2]), positionX: Number(node[3]), positionY: Number(node[4]), companies: { create: codes.map((code) => ({ companyId: companyIds.get(code)! })) } } });
        nodeIds.push(created.id);
      }
      await prisma.industryChainEdge.createMany({ data: chainSeed.edges.map(([source, target, label]) => ({ chainId: chain.id, sourceNodeId: nodeIds[Number(source)], targetNodeId: nodeIds[Number(target)], label: String(label) })) });
    }

    // 每家公司生成两类公告，并按序错开日期以便演示列表筛选。
    const announcementSeeds = companies.flatMap((company, index) => [
      { company, title: `${company.shortName}关于主营业务进展的自愿性披露公告`, category: '经营动态', dayOffset: index * 2 },
      { company, title: `${company.shortName}投资者关系活动记录表`, category: '投资者关系', dayOffset: index * 2 + 1 },
    ]);
    const admin = await prisma.adminUser.findUnique({ where: { username: 'admin' } });
    for (const seed of announcementSeeds) {
      const companyId = companyIds.get(seed.company.stockCode)!;
      let announcement = await prisma.announcement.findFirst({ where: { companyId, title: seed.title } });
      const data = { sourceName: '交易所公告', category: seed.category, content: `${seed.title}演示正文。本内容仅用于系统功能测试，不代表真实公告或投资建议。`, publishedAt: new Date(Date.now() - seed.dayOffset * 86_400_000), parseStatus: 'SUCCESS' as const, reviewStatus: seed.dayOffset % 3 === 0 ? 'APPROVED' as const : 'PENDING' as const, lastParsedAt: new Date() };
      announcement = announcement ? await prisma.announcement.update({ where: { id: announcement.id }, data }) : await prisma.announcement.create({ data: { ...data, companyId, title: seed.title } });
      const rawResult = { summary: `${seed.company.shortName}发布${seed.category}公告，演示解析已提取业务进展和风险提示。`, products: seed.company.products.slice(0, 2).map((item) => item[0]), industryImpact: `关注${seed.company.sector}行业后续变化。`, suggestedTags: seed.company.tags.slice(0, 2), risks: ['演示内容不构成投资建议'], opportunities: ['关注正式披露和后续进展'] };
      const existingResult = await prisma.aiParseResult.findFirst({ where: { announcementId: announcement.id, modelName: 'seed-mock-v1' } });
      const resultData = { rawResult, status: data.reviewStatus, reviewerId: data.reviewStatus === 'APPROVED' ? admin?.id : null, reviewedAt: data.reviewStatus === 'APPROVED' ? new Date() : null };
      if (existingResult) await prisma.aiParseResult.update({ where: { id: existingResult.id }, data: resultData });
      else await prisma.aiParseResult.create({ data: { ...resultData, announcementId: announcement.id, modelName: 'seed-mock-v1' } });
    }

    const quizSeeds: Array<[string, string, string[], string, string | null]> = [
      ['single', '动力电池在新能源汽车产业链中通常属于哪个环节？', ['上游资源', '中游制造', '下游服务', '金融服务'], '中游制造', '新能源汽车产业链'],
      ['single', '晶圆代工主要承担以下哪项工作？', ['芯片架构设计', '按照设计制造晶圆', '终端产品销售', '软件开发'], '按照设计制造晶圆', '半导体产业链'],
      ['judge', '光伏组件通常位于硅料和光伏电站之间。', ['正确', '错误'], '正确', '光伏产业链'],
      ['guess_company', '这家公司主营动力电池和储能系统，股票代码为 300750。', ['宁德时代', '隆基绿能', '招商银行', '恒瑞医药'], '宁德时代', null],
      ['single', '以下哪家公司属于白酒板块？', ['贵州茅台', '中芯国际', '科大讯飞', '宁德时代'], '贵州茅台', null],
      ['multiple', '以下哪些属于人工智能相关应用场景？', ['智能语音', '行业大模型', '智慧教育', '传统采矿'], '智能语音,行业大模型,智慧教育', null],
    ];
    for (const [type, question, options, answer, chainName] of quizSeeds) {
      const existing = await prisma.quizQuestion.findFirst({ where: { question: String(question) } });
      const data = { type, question, options, answer, explanation: '演示题目解析，可在后台继续编辑。', difficulty: 'medium', score: 10, status: 'PUBLISHED' as const, chainId: chainName ? chainIds.get(chainName) ?? null : null };
      if (existing) await prisma.quizQuestion.update({ where: { id: existing.id }, data }); else await prisma.quizQuestion.create({ data });
    }

    for (const taskSeed of [['交易所公告同步', 'announcement'], ['上市公司资料同步', 'company'], ['AI 内容批量解析', 'ai-parse']]) {
      const existing = await prisma.syncTask.findFirst({ where: { name: taskSeed[0] } });
      if (!existing) await prisma.syncTask.create({ data: { name: taskSeed[0], type: taskSeed[1], status: 'PENDING' } });
    }
    await prisma.auditLog.deleteMany({ where: { targetType: 'SeedData' } });
    await prisma.auditLog.create({ data: { adminId: admin?.id, module: 'system', action: 'seed', targetType: 'SeedData', targetId: 'default', summary: `一键导入演示数据：${companies.length} 家公司、${chainSeeds.length} 条产业链、${announcementSeeds.length} 条公告` } });
    console.log(`演示数据导入完成；已清理 ${removed.count} 家旧 DEMO 公司。`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
