# SG Bus Comming（巴士来了）

新加坡公交到站信息查询工具。支持收藏常用站点、实时查看到站时间，并可安装为 PWA 添加到手机桌面。

## 项目简介

**Bus Comming / 巴士来了** 面向新加坡公交用户，提供：

- 收藏站点与关注线路，一键查看实时到站
- 按站码全城搜索到站信息
- 中/英双语界面
- PWA 安装（Android 原生安装、iOS WebClip 描述文件）
- 本地缓存站点与到站数据，减少重复请求

数据来源：[ArriveLah2](https://arrivelah2.busrouter.sg/) 公交到站 API。

## 仓库结构

```
sg-bus-comming/
├── frontend/     # PWA 主应用（Next.js）
├── web/          # 营销落地页（Vite + React）
└── docs/         # 设计稿与需求文档
```

| 目录 | 说明 | 技术栈 |
|------|------|--------|
| `frontend/` | 可安装的 Web App，含 API 代理与 PWA 能力 | Next.js 16、React 19、Tailwind CSS 4、Cloudflare Pages |
| `web/` | 产品介绍页，引导用户打开或安装 App | Vite 8、React 19、Tailwind CSS 4、shadcn/ui |
| `docs/` | HTML 设计参考、PWA 安装方案等文档 | — |

各子项目有更详细的说明，见 [`frontend/README.md`](./frontend/README.md) 与 [`web/README.md`](./web/README.md)。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                         用户设备                              │
├──────────────────────────┬──────────────────────────────────┤
│   web/ 营销页             │   frontend/ PWA 主应用            │
│   (Vite 静态站点)         │   (Next.js App Router)           │
│                          │                                  │
│   · 功能介绍 / 截图轮播    │   · 到站 / 搜索 / 管理 三个 Tab   │
│   · 跳转 PWA 链接         │   · localStorage 站点与缓存       │
│   · 二维码 / 多语言       │   · PWA manifest + 安装引导       │
└──────────────────────────┴──────────────────────────────────┘
                                        │
                                        │ POST /api/weather
                                        ▼
                          ┌─────────────────────────┐
                          │  Next.js API Route      │
                          │  (Edge Runtime)         │
                          └────────────┬────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │  arrivelah2.busrouter.sg│
                          │  新加坡公交到站 API       │
                          └─────────────────────────┘
```

### frontend 主应用

- **页面**：单页应用（`src/app/page.tsx`），底部 Tab 切换「到站」「发现」「管理」
- **API 代理**：`/api/weather` 转发至 ArriveLah2，避免前端直接暴露上游接口，并将 `services` 转为卡片所需的到站时间字段
- **本地存储**：收藏站点、到站缓存、语言偏好、PWA 安装状态均保存在 `localStorage`
- **PWA**：
  - `manifest.ts` 定义应用元数据
  - Android：监听 `beforeinstallprompt` 触发安装
  - iOS：`/api/app/install-profile.mobileconfig` 生成 WebClip 描述文件
- **部署**：通过 `@opennextjs/cloudflare` 构建，发布到 Cloudflare Pages（需 `nodejs_compat`）

### web 营销页

- 展示产品特性、App 界面预览（组件化截图轮播）
- 「打开 Web App」按钮指向 `VITE_APP_URL`（默认 `https://bus.skycore.cloud`）
- 支持中英文切换

## 快速开始

### PWA 主应用

```bash
cd frontend
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

Cloudflare 部署：

```bash
npm run cf:build
npm run cf:deploy
```

### 营销落地页

```bash
cd web
yarn install
cp .env.example .env   # 可选：配置 VITE_APP_URL
yarn dev
```

访问 [http://localhost:5173](http://localhost:5173)。

## 环境要求

- Node.js 20.x（frontend 本地开发与 Cloudflare 部署建议一致）
- npm（frontend）/ yarn（web）

## 相关文档

- [frontend 开发与 API 说明](./frontend/README.md)
- [web 落地页说明](./web/README.md)
- [PWA 安装方案（Android + iOS）](./docs/需求/PWA安装按钮实现总结（Android+iOS）.md)
