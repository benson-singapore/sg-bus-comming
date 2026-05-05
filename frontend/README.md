# SG Bus Coming Frontend

本项目使用 Next.js（App Router）构建前端页面，并通过 Next.js API Route 在服务端代理真实后端接口，避免前端暴露 API Key，同时支持部署到 Cloudflare Pages。

## 版本与技术栈

- Next.js: `16.x`
- Node.js: `20.x`（建议本地和 Cloudflare 一致）
- 适配器: `@opennextjs/cloudflare`
- 运行时配置: `nodejs_compat`

## 本地开发

1. 安装依赖：

```bash
npm install --cache .npm-cache
```

2. 启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

## API 代理说明

- 代理入口：
  - `POST /api/weather`，body: `{ "stationCode": "67661" }`（推荐）
  - `GET /api/weather?city=67661`（兼容）
- 实现文件：`src/app/api/weather/route.ts`
- 调用路径：
  - 前端 -> `/api/weather`
  - Next.js API Route -> `https://arrivelah2.busrouter.sg/?id=xxxxx`
- `city` 参数会映射为上游接口的 `id`（站码）。
- 当前查询会把 `services` 数据转换成前端卡片使用的到站时间字段。

## 本地缓存与交互

- 收藏站点会缓存在浏览器 `localStorage`，刷新页面不会丢失。
- 查询到的站点到站信息也会按站码缓存，重复查询会先显示缓存再更新最新数据。
- 管理页支持拖拽排序站点，排序结果也会持久化到本地缓存。
- 管理页同一站点内的多条关注线路也支持拖拽排序（拖动线路标签调整顺序）。
- 管理页支持编辑站点（名称、站码、关注路线）与删除站点。

## Cloudflare 构建与部署

1. 构建 OpenNext 输出：

```bash
npm run cf:build
```

2. 本地模拟 Cloudflare Worker：

```bash
npm run cf:dev
```

3. 部署静态资源到 Cloudflare Pages：

```bash
npm run cf:deploy
```

## Cloudflare 控制台关键配置

在 Cloudflare Pages 项目中，请确认：

1. 环境变量：
   - `NODE_VERSION=20`
2. 兼容性标志：
   - Preview 与 Production 都开启 `nodejs_compat`

## 关键配置文件

- Next 配置：`next.config.ts`
  - `output: "standalone"`
  - `images.unoptimized: true`
- Cloudflare 配置：`wrangler.jsonc`
