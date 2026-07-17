# AIStock

上市公司知识图鉴项目，包含管理后台、用户端和一套共用的 NestJS API。

## 目录

- `aistock-admin-fe`：React 管理后台
- `aistock-user-fe`：React 用户端（当前为基础工程）
- `aistock-be`：NestJS + Prisma + MySQL 后端

本仓库使用 pnpm workspace 管理三个项目。除非特别说明，下面的命令都在仓库根目录（能看到 `pnpm-workspace.yaml` 的目录）执行，不需要进入三个子项目。

## 环境要求

- Node.js 22 或更高版本
- pnpm 11
- Docker Desktop（使用本地 MySQL 时需要）

## 第一次启动

以下命令全部在仓库根目录执行。

### 1. 安装三个项目的依赖

```bash
pnpm install
```

这是 pnpm workspace，根目录执行一次会统一安装三个项目的依赖并使用同一个 `pnpm-lock.yaml`。

### 2. 启动本地 MySQL

如果使用仓库提供的 Docker MySQL：

```bash
docker compose up -d mysql
```

如果使用阿里云 RDS 或其他已有 MySQL，可以跳过这一步，直接配置后端 `.env`。

### 3. 创建后端环境变量文件

macOS/Linux：

```bash
cp aistock-be/.env.example aistock-be/.env
```

Windows PowerShell：

```powershell
Copy-Item aistock-be/.env.example aistock-be/.env
```

真实配置文件必须位于 `aistock-be/.env`，不要把它提交到 GitHub。

### 4. 生成 Prisma Client

```bash
pnpm db:generate
```

### 5. 创建或更新本地开发数据库表

```bash
pnpm db:migrate
```

`db:migrate` 对应 `prisma migrate dev`，只用于本地开发。生产环境或阿里云服务器部署已有迁移时使用：

```bash
pnpm db:deploy
```

### 6. 初始化管理员账号

先在 `aistock-be/.env` 中设置管理员初始密码：

```env
JWT_SECRET="至少32位的随机字符串"
JWT_EXPIRES_IN="7d"
ADMIN_INITIAL_USERNAME="admin"
ADMIN_INITIAL_PASSWORD="你的管理员密码"
ADMIN_INITIAL_DISPLAY_NAME="管理员"
```

然后在仓库根目录执行：

```bash
pnpm db:seed-admin
```

该命令会创建用户名为 `admin` 的管理员；如果账号已经存在，则更新密码和显示名称。请勿把真实密码或 JWT 密钥提交到 GitHub。

## 启动项目

建议打开多个终端，所有终端都停留在仓库根目录。

### 启动管理后台

```bash
pnpm dev:admin
```

访问地址：`http://localhost:3719`

### 启动用户端

```bash
pnpm dev:user
```

访问地址：`http://localhost:3718`

### 启动后端

```bash
pnpm dev:be
```

后端接口：`http://localhost:3717/api`  
Swagger：`http://localhost:3717/docs`

根目录命令本质上通过 pnpm 的 `--filter` 找到对应子项目。例如：

```bash
pnpm dev:admin
# 等价于：pnpm --filter aistock-admin-fe dev
```

当然也可以进入子目录后启动，例如：

```bash
cd aistock-admin-fe
pnpm dev
```

但在日常开发中，推荐统一在根目录使用 `pnpm dev:admin`、`pnpm dev:user` 和 `pnpm dev:be`。

## 后端环境变量

配置文件位置：`aistock-be/.env`。

```env
NODE_ENV=development
PORT=3717
DATABASE_URL="mysql://aistock:aistock@localhost:3306/aistock"
CORS_ORIGINS="http://localhost:3718,http://localhost:3719"
JWT_SECRET="请替换为至少32位的随机字符串"
JWT_EXPIRES_IN="7d"
ADMIN_INITIAL_USERNAME="admin"
ADMIN_INITIAL_PASSWORD="请设置管理员初始密码"
ADMIN_INITIAL_DISPLAY_NAME="管理员"
```

当前后端和 Prisma 只读取完整的 `DATABASE_URL`，不读取 `DATABASE_USER`、`DATABASE_PASSWORD`、`DATABASE_HOST` 等拆分变量，因此不需要重复配置。

MySQL 连接字符串格式：

```text
mysql://用户名:密码@主机地址:端口/数据库名
```

阿里云 RDS 示例：

```env
DATABASE_URL="mysql://aistock_user:your_password@rm-xxxxxxxx.mysql.rds.aliyuncs.com:3306/aistock"
```

如果用户名或密码包含 `@`、`#`、`%`、`:`、`/` 等特殊字符，需要先进行 URL 编码。阿里云环境应优先使用 RDS 内网地址，并确保 RDS 白名单允许后端所在 ECS 访问。

## 常用根目录命令

| 命令 | 作用 |
| --- | --- |
| `pnpm install` | 安装整个 workspace 的依赖 |
| `pnpm dev:admin` | 启动管理后台 |
| `pnpm dev:user` | 启动用户端 |
| `pnpm dev:be` | 启动后端 |
| `pnpm build` | 构建三个项目 |
| `pnpm typecheck` | 检查三个项目的 TypeScript 类型 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:migrate` | 本地开发环境创建迁移并更新数据库 |
| `pnpm db:deploy` | 生产环境执行已经提交的迁移 |
| `pnpm db:seed-admin` | 创建或重置管理员 `admin` 的密码 |
