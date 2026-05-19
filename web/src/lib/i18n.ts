export type Lang = "zh" | "en"

/** 与 frontend PWA 共用，切换语言后打开 App 可保持一致 */
export const LANG_STORAGE_KEY = "sg-bus-coming:lang"

export const dictionary = {
  zh: {
    metaTitle: "Bus Comming - 新加坡巴士到站查询",
    appName: "Bus Comming",
    navFeatures: "功能特性",
    navGuide: "使用指南",
    navInstall: "添加到桌面",
    tryNow: "立即体验",
    heroBadge: "新加坡本地最优巴士查询体验",
    heroTitle1: "精准掌握时间",
    heroTitle2: "告别车站苦等",
    heroDesc:
      "Bus Comming 为您提供最实时的新加坡巴士到站数据。直观的设计、一键收藏站点、毫秒级刷新，让您的每一次出行都从容不迫。",
    openWebApp: "立即打开 Web App",
    scanQr: "手机扫码体验",
    scanQrTitle: "扫码打开 Web App",
    scanQrDesc: "使用手机相机或微信扫一扫",
    close: "关闭",
    featuresTitle: "专注体验，化繁为简",
    featuresDesc:
      "去掉所有多余的广告和复杂的设置，只为您提供最纯粹、最快速的巴士查询服务。",
    featureRealtimeTitle: "实时精准计时",
    featureRealtimeDesc:
      '直观展示 "NOW"、"NEXT"、"LATER" 三班巴士的到站时间。独特的进度条设计，车辆位置一目了然。',
    featurePwaTitle: "免安装，即点即用",
    featurePwaDesc:
      "采用先进的 H5 / PWA 技术，无需前往应用商店下载。打开网页即可使用，更可直接添加到手机桌面，享受原生级顺滑体验。",
    featureHallTitle: "个性化候车厅",
    featureHallDesc:
      "您可以自由添加、重命名和排序常去的公交站（如：Home, SengKang），打造属于您的私人候车大厅。",
    downloadTitle: "即刻体验，无需等待下载",
    downloadDesc:
      "Bus Comming 是一款渐进式网络应用 (PWA)。只需简单的几步，您就能将它永久保存在手机桌面上，享受零延迟、无广告的原生级查车体验。",
    iosTitle: "苹果 iOS 用户",
    androidTitle: "安卓 Android 用户",
    iosStep1: "在 Safari 浏览器中打开",
    iosStep2Before: "点击底部工具栏的",
    share: "分享",
    iosStep2After: "按钮",
    iosStep3: '下拉列表，选择"添加到主屏幕"',
    androidStep1: "在 Chrome 浏览器中打开",
    androidStep2: "点击右上角的",
    androidMenu: "菜单 (⋮)",
    androidStep2After: "按钮",
    androidStep3: '在列表中选择"添加到主屏幕"',
    openInBrowser: "立即在浏览器中打开",
    privacy: "隐私政策",
    terms: "服务条款",
    contact: "联系我们",
    copyright: "Data provided by LTA DataMall.",
    langSwitch: "English",
    langAria: "切换为英文",
    previewWaitingHall: "候车大厅",
    previewSearchStop: "搜索站点",
    previewSavedStops: "收藏站点",
    previewSearchHint: "搜索提示",
    previewRoutes: "3 条线路",
    previewStopCode: "站点",
    previewSearchPlaceholder: "输入站点编号…",
    cardStation: "站点 67009",
    cardNow: "NOW",
    cardArriving: "ARRIVING",
    cardMin: "分",
    cardSec: "秒",
    cardNext: "NEXT",
    cardLater: "LATER",
    cardGps: "GPS",
    live: "LIVE",
    station: "Station",
  },
  en: {
    metaTitle: "Bus Comming - Singapore Bus Arrivals",
    appName: "Bus Comming",
    navFeatures: "Features",
    navGuide: "How it works",
    navInstall: "Add to Home Screen",
    tryNow: "Try now",
    heroBadge: "Best bus arrival experience in Singapore",
    heroTitle1: "Know exactly when",
    heroTitle2: "Skip the long wait",
    heroDesc:
      "Bus Comming delivers real-time Singapore bus arrivals with a clean UI, saved stops, and fast refresh—so every trip feels effortless.",
    openWebApp: "Open Web App",
    scanQr: "Scan on mobile",
    scanQrTitle: "Scan to open Web App",
    scanQrDesc: "Use your camera or a QR scanner app",
    close: "Close",
    featuresTitle: "Simple by design",
    featuresDesc:
      "No ads, no clutter—just fast, focused bus arrival information when you need it.",
    featureRealtimeTitle: "Live countdown",
    featureRealtimeDesc:
      'See "NOW", "NEXT", and "LATER" at a glance. A unique progress bar shows where the bus is on its approach.',
    featurePwaTitle: "No install required",
    featurePwaDesc:
      "Built as a PWA—open in your browser and add to your home screen for a native-like experience without the app store.",
    featureHallTitle: "Your waiting hall",
    featureHallDesc:
      "Add, rename, and reorder favourite stops (e.g. Home, SengKang) into a personal waiting hall.",
    downloadTitle: "Start now—no download wait",
    downloadDesc:
      "Bus Comming is a Progressive Web App (PWA). Save it to your home screen in a few taps for instant, ad-free arrivals.",
    iosTitle: "iPhone (iOS)",
    androidTitle: "Android",
    iosStep1: "Open in Safari",
    iosStep2Before: "Tap the",
    share: "Share",
    iosStep2After: "button at the bottom",
    iosStep3: 'Scroll and choose "Add to Home Screen"',
    androidStep1: "Open in Chrome",
    androidStep2: "Tap the",
    androidMenu: "menu (⋮)",
    androidStep2After: "at the top right",
    androidStep3: 'Choose "Add to Home Screen"',
    openInBrowser: "Open in browser",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    copyright: "Data provided by LTA DataMall.",
    langSwitch: "中文",
    langAria: "Switch to Chinese",
    previewWaitingHall: "Waiting Hall",
    previewSearchStop: "Search Stop",
    previewSavedStops: "Saved Stops",
    previewSearchHint: "Search Hint",
    previewRoutes: "3 routes",
    previewStopCode: "Stop",
    previewSearchPlaceholder: "Enter stop code…",
    cardStation: "Stop 67009",
    cardNow: "NOW",
    cardArriving: "ARRIVING",
    cardMin: "min",
    cardSec: "sec",
    cardNext: "NEXT",
    cardLater: "LATER",
    cardGps: "GPS",
    live: "LIVE",
    station: "Station",
  },
} as const

export type I18nText = (typeof dictionary)[Lang]

export function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh"
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY)
    if (raw === "zh" || raw === "en") return raw
  } catch {
    // ignore
  }
  const browser = navigator.language.toLowerCase()
  return browser.startsWith("zh") ? "zh" : "en"
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // ignore
  }
}

export const FEATURE_KEYS = [
  {
    icon: "clock" as const,
    titleKey: "featureRealtimeTitle" as const,
    descKey: "featureRealtimeDesc" as const,
  },
  {
    icon: "zap" as const,
    titleKey: "featurePwaTitle" as const,
    descKey: "featurePwaDesc" as const,
    highlight: true,
  },
  {
    icon: "map-pin" as const,
    titleKey: "featureHallTitle" as const,
    descKey: "featureHallDesc" as const,
  },
] as const
