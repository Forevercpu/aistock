import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

const demoCompanies = [
  { stockCode: 'DEMO-001', name: '星云智造股份有限公司', shortName: '星云智造', exchange: 'SSE', status: 'PUBLISHED' as const, foundedAt: '2008-05-16', listedAt: '2018-09-12', sector: '高端制造', tags: ['智能制造', '机器人'], description: '面向工业客户提供智能生产设备与自动化解决方案。', products: [['工业机器人', 42.6], ['智能产线', 35.2], ['运维服务', 22.2]] },
  { stockCode: 'DEMO-002', name: '深蓝能源科技股份有限公司', shortName: '深蓝能源', exchange: 'SZSE', status: 'PUBLISHED' as const, foundedAt: '2011-03-08', listedAt: '2021-06-18', sector: '新能源', tags: ['储能', '绿色能源'], description: '专注新型储能系统及能源管理平台的研发与服务。', products: [['储能电池系统', 54.8], ['能源管理软件', 27.4], ['电站运维', 17.8]] },
  { stockCode: 'DEMO-003', name: '光域半导体股份有限公司', shortName: '光域半导体', exchange: 'SSE', status: 'PUBLISHED' as const, foundedAt: '2013-11-20', listedAt: '2022-01-26', sector: '半导体', tags: ['芯片设计', '国产替代'], description: '提供工业控制和智能终端领域的芯片设计方案。', products: [['控制芯片', 48.3], ['传感器芯片', 31.7], ['技术授权', 20.0]] },
  { stockCode: 'DEMO-004', name: '云帆计算技术股份有限公司', shortName: '云帆计算', exchange: 'SZSE', status: 'DRAFT' as const, foundedAt: '2015-07-10', listedAt: '2023-04-11', sector: '计算机', tags: ['云计算', 'AI 算力'], description: '建设企业级云计算平台并提供算力调度服务。', products: [['云平台服务', 46.1], ['算力租赁', 38.5], ['技术服务', 15.4]] },
  { stockCode: 'DEMO-005', name: '远见医疗科技股份有限公司', shortName: '远见医疗', exchange: 'SSE', status: 'PUBLISHED' as const, foundedAt: '2006-02-22', listedAt: '2017-12-05', sector: '医药生物', tags: ['医疗器械', '数字医疗'], description: '研发医学影像设备及数字化诊疗系统。', products: [['医学影像设备', 61.2], ['诊疗软件', 24.6], ['售后服务', 14.2]] },
  { stockCode: 'DEMO-006', name: '青禾消费品股份有限公司', shortName: '青禾消费', exchange: 'SZSE', status: 'PUBLISHED' as const, foundedAt: '2003-08-18', listedAt: '2014-05-09', sector: '食品饮料', tags: ['消费升级', '国货品牌'], description: '运营健康食品、饮品及线上消费品牌。', products: [['健康食品', 45.7], ['植物饮品', 39.8], ['其他产品', 14.5]] },
  { stockCode: 'DEMO-007', name: '北辰新材料股份有限公司', shortName: '北辰材料', exchange: 'SSE', status: 'PUBLISHED' as const, foundedAt: '2009-12-03', listedAt: '2019-08-27', sector: '新材料', tags: ['先进材料', '新能源'], description: '生产面向新能源和电子行业的高性能复合材料。', products: [['复合材料', 51.5], ['电子材料', 34.0], ['材料检测服务', 14.5]] },
  { stockCode: 'DEMO-008', name: '灵犀软件股份有限公司', shortName: '灵犀软件', exchange: 'SZSE', status: 'DRAFT' as const, foundedAt: '2016-04-15', listedAt: '2024-03-20', sector: '计算机', tags: ['企业软件', '人工智能'], description: '为企业提供智能协同、数据分析和行业应用软件。', products: [['企业软件订阅', 57.9], ['行业解决方案', 29.6], ['实施服务', 12.5]] },
  { stockCode: 'DEMO-009', name: '华景环保科技股份有限公司', shortName: '华景环保', exchange: 'SSE', status: 'ARCHIVED' as const, foundedAt: '2007-09-26', listedAt: '2016-11-14', sector: '环保', tags: ['节能环保', '循环经济'], description: '开展工业水处理、资源回收和环保工程业务。', products: [['水处理设备', 43.4], ['环保工程', 40.8], ['资源回收', 15.8]] },
  { stockCode: 'DEMO-010', name: '凌峰汽车科技股份有限公司', shortName: '凌峰汽车', exchange: 'SZSE', status: 'PUBLISHED' as const, foundedAt: '2005-01-12', listedAt: '2015-07-30', sector: '汽车', tags: ['智能驾驶', '汽车零部件'], description: '研发智能汽车电子和底盘控制核心零部件。', products: [['汽车电子', 49.2], ['底盘控制系统', 36.3], ['测试服务', 14.5]] },
  { stockCode: 'DEMO-011', name: '星链通信股份有限公司', shortName: '星链通信', exchange: 'SSE', status: 'PUBLISHED' as const, foundedAt: '2010-06-01', listedAt: '2020-10-19', sector: '通信', tags: ['光通信', '数据中心'], description: '提供高速光通信器件和数据中心网络设备。', products: [['光通信模块', 63.7], ['网络设备', 25.1], ['技术服务', 11.2]] },
  { stockCode: 'DEMO-012', name: '云谷农业科技股份有限公司', shortName: '云谷农业', exchange: 'SZSE', status: 'DRAFT' as const, foundedAt: '2012-10-09', listedAt: '2022-08-08', sector: '农林牧渔', tags: ['智慧农业', '种业'], description: '通过数字化技术提供育种、种植管理和农业服务。', products: [['种业产品', 47.8], ['农业数字平台', 30.5], ['农技服务', 21.7]] },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('缺少 DATABASE_URL');

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
  try {
    for (const item of demoCompanies) {
      const { products, sector: sectorName, tags: tagNames, foundedAt, listedAt, ...companyData } = item;
      const company = await prisma.company.upsert({
        where: { stockCode: item.stockCode },
        update: { ...companyData, foundedAt: new Date(foundedAt), listedAt: new Date(listedAt) },
        create: { ...companyData, foundedAt: new Date(foundedAt), listedAt: new Date(listedAt) },
      });

      const sector = await prisma.sector.upsert({
        where: { name: sectorName },
        update: {},
        create: { name: sectorName },
      });
      await prisma.companySector.upsert({
        where: { companyId_sectorId: { companyId: company.id, sectorId: sector.id } },
        update: {},
        create: { companyId: company.id, sectorId: sector.id },
      });

      for (const tagName of tagNames) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        await prisma.companyTag.upsert({
          where: { companyId_tagId: { companyId: company.id, tagId: tag.id } },
          update: {},
          create: { companyId: company.id, tagId: tag.id },
        });
      }

      for (const [name, revenueRate] of products) {
        const existing = await prisma.product.findFirst({ where: { companyId: company.id, name: String(name) } });
        const data = { name: String(name), revenueRate: Number(revenueRate), description: `${item.shortName}的演示主营产品数据` };
        if (existing) await prisma.product.update({ where: { id: existing.id }, data });
        else await prisma.product.create({ data: { ...data, companyId: company.id } });
      }
    }

    console.log(`演示数据初始化完成：${demoCompanies.length} 家公司`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
