# AIStock

上市公司知识图鉴项目，包含管理后台、用户端和一套共用的 NestJS API。

## 目录

- `aistock-admin-fe`：React 管理后台
- `aistock-user-fe`：React 用户端（当前为基础工程）
- `aistock-be`：NestJS + Prisma + MySQL 后端

## 本地启动

1. 安装依赖：`pnpm install`
2. 启动 MySQL：`docker compose up -d mysql`
3. 复制后端配置：`cp aistock-be/.env.example aistock-be/.env`
4. 生成 Prisma Client：`pnpm db:generate`
5. 创建数据库表：`pnpm db:migrate`
6. 启动后端：`pnpm dev:be`
7. 启动管理后台：`pnpm dev:admin`

默认地址：管理后台 `http://localhost:5173`，后端 `http://localhost:3000`，Swagger `http://localhost:3000/docs`。

