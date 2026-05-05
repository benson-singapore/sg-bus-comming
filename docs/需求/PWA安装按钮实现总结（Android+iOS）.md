# PWA 安装按钮实现总结（Android + iOS）

本文档基于当前项目 `front-end/app` 的实现，整理出一个可在其它项目中直接复用的“安装到桌面”方案，分三层：

- **Android**：走浏览器原生 PWA 安装（`beforeinstallprompt`）。
- **iOS（默认）**：通过 **描述文件（`.mobileconfig`）** 安装 WebClip（桌面图标）。
- **iOS（可切换）**：通过 Safari **“添加到主屏幕”** 的手动方式安装。

对应核心文件：

- 前端入口组件：`front-end/app/src/components/pwa/PwaInstallEntry.tsx`
- PWA 配置：`front-end/app/vite.config.ts`、`front-end/app/index.html`、`front-end/app/src/pwa/register.ts`
- 后端接口（iOS 描述文件 + 配置）：`back-end/internal/handlers/public_config_handler.go`、`back-end/internal/routes/routes.go`

---

## 一、前端整体策略（何时显示“安装”按钮）

项目里 `PwaInstallEntry` 的显示规则（简化后）：

1. **如果已经是独立运行（standalone）**：不显示  
   - `matchMedia("(display-mode: standalone)")`（通用）
   - `navigator.standalone`（iOS Safari 特有）
2. **如果用户之前点击“安装”且被本地标记**：不显示  
   - `localStorage["tuangou_pwa_installed"] === "1"`
3. **否则**：
   - **Android/支持 A2HS 的浏览器**：当捕获到 `beforeinstallprompt` 事件后显示（表示具备原生安装能力）
   - **iOS**：只要识别到 iOS 设备就显示（iOS 没有 `beforeinstallprompt`）

你在其它项目复用时，可以保持同样的策略：**有原生安装能力就走原生；iOS 则给出明确指引/替代方案**。

---

## 二、Android：通过 `beforeinstallprompt` 触发 PWA 安装

### 1）关键点

- **不要让浏览器自动弹安装提示**：在 `beforeinstallprompt` 中 `e.preventDefault()`，把事件保存起来，等待用户点击按钮时再 `prompt()`。
- **用户选择**：通过 `userChoice` 判断 accepted/dismissed。
- **安装完成监听**：监听 `appinstalled`，用于清理状态与埋点（可选）。

### 2）可直接复用的核心代码（React）

```ts
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>
}

const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

useEffect(() => {
  const onBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    setInstallPrompt(e as BeforeInstallPromptEvent)
  }
  const onAppInstalled = () => {
    setInstallPrompt(null)
    // 你的埋点/提示逻辑
  }

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
  window.addEventListener("appinstalled", onAppInstalled)
  return () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.removeEventListener("appinstalled", onAppInstalled)
  }
}, [])

async function handleInstallClick() {
  if (!installPrompt) return
  try {
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice.catch(() => null)
    if (choice?.outcome === "accepted") {
      // 可选：本地标记，避免重复显示
      localStorage.setItem("pwa_installed_mark", "1")
    }
  } finally {
    // 无论如何都清理事件（该事件通常只能用一次）
    setInstallPrompt(null)
  }
}
```

### 3）Android 方案的前置条件（必须满足）

Android 的原生安装能否出现，取决于你的 PWA 是否“像个 PWA”：

- **HTTPS**（或 localhost）
- **有可访问的 manifest**（例如 `/manifest.webmanifest`）
- **有 service worker**（离线能力/缓存策略由你决定）
- **图标齐全**（至少 192/512）

本项目用的是 `vite-plugin-pwa` 自动生成 `manifest.webmanifest` 和 SW：

- `front-end/app/vite.config.ts` 使用 `VitePWA(...)`
- `front-end/app/src/pwa/register.ts` 使用 `virtual:pwa-register` 注册 SW

---

## 三、iOS：两种安装方式（默认描述文件 + 手动添加主屏幕）

iOS Safari **不支持** `beforeinstallprompt`，所以前端只能：

- **识别 iOS 设备** → 显示安装入口 → 弹出帮助面板 → 让用户选择安装方式

### 1）iOS 设备识别（含 iPadOS 13+）

项目中做法：

- iPhone/iPad/iPod：通过 UA 判断
- iPadOS 13+：`navigator.platform === "MacIntel" && maxTouchPoints > 1`（常见写法）

可直接复用：

```ts
function isIosDevice() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent || ""
  const iOS = /iPad|iPhone|iPod/.test(ua)
  const iPadOS13Plus =
    navigator.platform === "MacIntel" &&
    typeof (navigator as any).maxTouchPoints === "number" &&
    (navigator as any).maxTouchPoints > 1
  return iOS || iPadOS13Plus
}
```

### 2）判断是否已“以桌面 App 运行”（standalone）

```ts
function isRunningStandalone() {
  if (typeof window === "undefined") return false
  const displayModeStandalone = Boolean(
    window.matchMedia?.("(display-mode: standalone)")?.matches,
  )
  const iosStandalone = Boolean((window.navigator as any)?.standalone)
  return displayModeStandalone || iosStandalone
}
```

### 3）iOS 方式 A（默认）：描述文件 `.mobileconfig` 安装 WebClip

#### 3.1 原理

后端返回一个 `application/x-apple-aspen-config` 的 **配置描述文件**，其中包含 `com.apple.webClip.managed` payload（WebClip）。

用户点击下载后，iOS 会提示安装描述文件；安装完成后桌面出现一个图标，点击后以“类 App”方式打开你的站点。

#### 3.2 前端怎么接

本项目 `PwaInstallEntry` 里直接给了下载链接：

- `installProfileUrl = /api/app/install-profile.mobileconfig`
- iOS 安装面板默认选中“描述文件安装”

其它项目复用时，你只需要：

- 提供一个 `<a href="...mobileconfig">下载描述文件</a>`
- 同时提供“添加到主屏幕”的 fallback（避免企业/学校设备禁止安装描述文件）

#### 3.3 后端怎么做（Go/Fiber 示例，来自本项目）

本项目路由：

- `GET /api/app/install-config`
- `GET /api/app/install-profile.mobileconfig`

`install-profile.mobileconfig` 的关键点：

- 校验 `installURL` 必须是完整的 `http/https` URL（scheme + host）
- 读取图标文件 `assets/install/apple-touch-icon.png` 并 base64 内嵌到 mobileconfig
- 生成 UUID，拼出 plist 内容
- 返回响应头：
  - `Content-Type: application/x-apple-aspen-config; charset=utf-8`
  - `Content-Disposition: attachment; filename="xxx.mobileconfig"`

在你的新项目里，最小可用实现只要：

1. 一个 `installURL`（你希望 WebClip 打开的 URL）
2. 一张 `apple-touch-icon.png`（建议 180x180 或更大）
3. 输出 plist（mobileconfig）字符串

#### 3.4 mobileconfig 的关键字段（你需要知道的“骨架”）

- `PayloadType: Configuration`（外层）
- `PayloadContent` 数组里放 WebClip payload：
  - `PayloadType: com.apple.webClip.managed`
  - `Label`：桌面图标标题
  - `URL`：点击图标后打开的 URL
  - `Icon`：base64 的 PNG
  - `FullScreen: true`：更像独立 App
  - `IsRemovable: true`：允许移除

（本项目 `front-end/app/public/tuangou-shop.mobileconfig` 也是同类产物，只是 icon 很大所以文件体积巨大，不建议在文档里内嵌示例文件。）

### 4）iOS 方式 B：Safari “添加到主屏幕”（手动指引）

这个方式不需要后端支持，主要是 UX 指引：

- Step1：在 Safari 点击“分享”
- Step2：选择“添加到主屏幕”
- Step3：确认后从桌面打开

本项目在 `PwaInstallEntry` 里做成了一个弹窗，并提供中英文本，逻辑上：

- iOS 点击安装按钮 → 打开弹窗
- 弹窗顶部 Tab：`profile`（默认） / `manual`
- `manual` 分支只展示 3 步提示

其它项目复用建议：

- **一定要提示用户：iOS 必须 Safari**（微信/Chrome iOS 都是 WebKit 壳，菜单不同，且安装入口不一致）
- 文案里加一句：如果菜单里没看到“添加到主屏幕”，让用户向下滚动分享菜单

---

## 四、PWA 必要配置（保证 Android 可触发安装、iOS 体验更像 App）

### 1）Manifest + 图标

本项目通过 `vite-plugin-pwa` 配置 manifest（`vite.config.ts`）：

- `display: "standalone"`
- `start_url: "/"`
- icons：192/512 PNG

### 2）iOS 相关 meta

本项目 `index.html` 已包含：

- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`

并且在顶部栏动态设置：

- `meta[name="apple-mobile-web-app-title"]`（见 `front-end/app/src/features/community-pick/components/layout/TopBar.tsx`）

### 3）Service Worker 注册

本项目 `src/pwa/register.ts`：

- `registerSW({ immediate: true })`

其它项目中你可以在入口 `main.tsx` 里调用一次注册函数即可。

---

## 五、建议的“可复用模块”拆分（方便复制到其它项目）

如果你要在新项目中快速落地，建议拆为三个小模块（避免单文件过长，也便于测试）：

1. `usePwaInstallPrompt()`：封装 `beforeinstallprompt/appinstalled` 监听与 `prompt()` 调用
2. `useStandalone()`：封装 `display-mode: standalone` + iOS `navigator.standalone` 判断
3. `IosInstallSheet`：纯 UI 组件（描述文件下载 + 手动指引）

当前项目把它们都写在 `PwaInstallEntry.tsx` 里，你复制时可以按上述方式拆分。

---

## 六、边缘情况与最佳实践

- **`beforeinstallprompt` 只会触发一次**：点击后务必清理缓存的 event，并且不要假设刷新后还能再次拿到。
- **iOS 描述文件可能被策略禁用**：务必提供“添加到主屏幕”的 fallback。
- **安装后仍显示按钮**：iOS 有时 `display-mode` 变化不及时；本项目额外用 `localStorage` 标记（`tuangou_pwa_installed`）做兜底，你也可以保留。
- **必须 HTTPS**：Android 的安装与扫码等能力通常依赖安全上下文（secure context）。
- **图标文件不要太大**：`.mobileconfig` 里内嵌 icon 会导致文件暴涨；建议提供一张尺寸合适的 PNG（180~512），并确保压缩。

