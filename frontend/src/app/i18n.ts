export type Lang = "zh" | "en";

export const LANG_STORAGE_KEY = "sg-bus-coming:lang";

export const dictionary = {
  zh: {
    appTitle: "巴士来了",
    tabArrivals: "到站",
    tabDiscover: "发现",
    tabManage: "管理",
    hallTitle: "候车大厅",
    manageTitle: "站点收藏",
    addStation: "新增站点",
    drag: "拖拽",
    stopCode: "站台代码",
    searchCityTitle: "全城搜索",
    searchPlaceholder: "请输入站码...",
    searchButton: "查询",
    searchFailed: "未能获取到站数据，请检查站码后重试",
    queryFailed: "查询失败，请稍后重试",
    addModalAddTitle: "添加收藏",
    addModalEditTitle: "编辑站点",
    addModalAddHint: "补充名称后可自动保存",
    addModalEditHint: "可修改站点名称和关注路线",
    stationNameLabel: "站点名称",
    stationCodeLabel: "站码",
    routesLabel: "关注路线",
    routesHint: "支持多个线路，使用逗号分隔",
    routesPlaceholder: "如 371, 857, 963",
    confirmAdd: "确认收藏",
    confirmEdit: "保存修改",
    removed: "站点已从清单中移除",
    added: "站点已成功加入收藏",
    updated: "站点信息已更新",
    stationSorted: "站点排序已更新",
    routeSorted: "线路排序已更新",
    currentTrip: "当前班次",
    nextTrip: "下一趟",
    nextNextTrip: "下下趟",
    statusSoon: "快到了",
    statusComing: "即将到站",
    gpsTime: "GPS定位",
    realtimeStatus: "实时状态",
    installApp: "安装应用",
    installing: "安装中...",
    installUnavailable: "当前环境暂不支持安装",
    installHintAndroid: "推荐添加到主屏幕，便于快速打开",
    installHintIosTitle: "iPhone 安装指引",
    installHintIosStep1: "请使用 Safari 打开当前页面",
    installHintIosStep2: "点击底部“分享”按钮",
    installHintIosStep3: "选择“添加到主屏幕”并确认",
    close: "关闭",
  },
  en: {
    appTitle: "BUS COMMING",
    tabArrivals: "Arrivals",
    tabDiscover: "Discover",
    tabManage: "Manage",
    hallTitle: "Waiting Hall",
    manageTitle: "Saved Stops",
    addStation: "Add Stop",
    drag: "Drag",
    stopCode: "Stop Code",
    searchCityTitle: "Search",
    searchPlaceholder: "Enter stop code...",
    searchButton: "Search",
    searchFailed: "Failed to load arrivals. Please verify the stop code.",
    queryFailed: "Request failed. Please try again later.",
    addModalAddTitle: "Add to Saved",
    addModalEditTitle: "Edit Stop",
    addModalAddHint: "Fill in the name to auto-save",
    addModalEditHint: "Edit stop name and routes",
    stationNameLabel: "Stop Name",
    stationCodeLabel: "Stop Code",
    routesLabel: "Routes",
    routesHint: "Multiple routes supported, separated by commas",
    routesPlaceholder: "e.g. 371, 857, 963",
    confirmAdd: "Save",
    confirmEdit: "Save Changes",
    removed: "Removed from saved stops",
    added: "Added to saved stops",
    updated: "Stop updated",
    stationSorted: "Stop order updated",
    routeSorted: "Route order updated",
    currentTrip: "Now",
    nextTrip: "Next",
    nextNextTrip: "Later",
    statusSoon: "Arriving",
    statusComing: "On the way",
    gpsTime: "GPS",
    realtimeStatus: "Live",
    installApp: "Install App",
    installing: "Installing...",
    installUnavailable: "Install is not available in this environment",
    installHintAndroid: "Add to home screen for quicker access",
    installHintIosTitle: "iPhone Install Guide",
    installHintIosStep1: "Open this page with Safari",
    installHintIosStep2: 'Tap the "Share" button at the bottom',
    installHintIosStep3: 'Choose "Add to Home Screen" and confirm',
    close: "Close",
  },
} as const;

export function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    if (raw === "zh" || raw === "en") return raw;
  } catch {
    // ignore
  }
  return "zh";
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}
