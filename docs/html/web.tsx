import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Search, 
  MapPin, 
  Clock, 
  Settings, 
  ChevronRight, 
  Star, 
  Smartphone, 
  Apple,
  Play,
  ArrowUpRight,
  Globe,
  RefreshCw,
  Plus,
  ExternalLink,
  QrCode,
  Zap,
  Share
} from 'lucide-react';

// --- 动态浮动图标展示组件 ---

const FloatingBusGraphic = () => {
  return (
    <div className="relative w-full max-w-md aspect-square flex items-center justify-center mt-12 lg:mt-0">
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.05); }
        }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 5s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite 2s; }
      `}</style>

      {/* 中央主体 (SG BUS) */}
      <div className="relative z-20 w-56 h-56 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center animate-float-1 shadow-emerald-500/40 border-[4px] border-white/40 backdrop-blur-md">
        <Bus size={72} className="text-white mb-2" />
        <div className="text-white font-black text-3xl tracking-wider">SG BUS</div>
        <div className="absolute -bottom-5 bg-slate-900 text-emerald-400 text-sm font-bold px-6 py-2 rounded-full shadow-xl flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
          LIVE
        </div>
      </div>

      {/* 浮动元素 1：时间/倒计时 */}
      <div className="absolute top-10 right-0 lg:-right-6 z-30 w-28 h-28 bg-white rounded-full shadow-xl flex flex-col items-center justify-center animate-float-2 border border-slate-100">
        <Clock size={32} className="text-orange-500 mb-1" />
        <div className="text-slate-800 font-bold text-lg">0<span className="text-xs text-slate-500 mx-0.5">分</span>7<span className="text-xs text-slate-500 ml-0.5">秒</span></div>
      </div>

      {/* 浮动元素 2：站点位置 */}
      <div className="absolute bottom-12 left-0 lg:-left-6 z-30 w-24 h-24 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-xl flex flex-col items-center justify-center animate-float-3 border border-slate-100">
        <MapPin size={28} className="text-emerald-500 mb-2" />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Station</span>
      </div>

      {/* 浮动元素 3：极速闪电 */}
      <div className="absolute top-24 left-8 lg:left-0 z-10 w-14 h-14 bg-yellow-100 rounded-full shadow-lg flex items-center justify-center animate-float-2" style={{ animationDelay: '1.5s' }}>
        <Zap size={24} className="text-yellow-600" />
      </div>

      {/* 浮动元素 4：收藏/星标 */}
      <div className="absolute bottom-24 right-10 z-10 w-16 h-16 bg-emerald-50 rounded-2xl shadow-lg flex items-center justify-center animate-float-1 rotate-12" style={{ animationDelay: '0.5s' }}>
         <Star size={28} className="text-emerald-400" />
      </div>
    </div>
  );
};

// --- 主页面组件 ---

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  // 监听滚动以改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 导航栏 */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-sm">
              <Bus size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">Bus Comming</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">功能特性</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">使用指南</a>
            <a href="#download" className="hover:text-emerald-600 transition-colors">添加到桌面</a>
          </div>
          <button className="hidden md:flex items-center px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20">
            立即体验 <ExternalLink size={16} className="ml-1" />
          </button>
        </div>
      </nav>

      {/* 首屏 Hero 区域 */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-emerald-100/50 to-transparent -z-10 rounded-b-[100%] blur-3xl opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 mb-16 lg:mb-0 text-center lg:text-left z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
              <Star size={14} className="mr-1.5 fill-emerald-700" />
              新加坡本地最优巴士查询体验
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              精准掌握时间 <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">告别车站苦等</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Bus Comming 为您提供最实时的新加坡巴士到站数据。直观的设计、一键收藏站点、毫秒级刷新，让您的每一次出行都从容不迫。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5">
                <ExternalLink size={20} className="mr-2" />
                立即打开 Web App
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-white text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-all shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5">
                <QrCode size={20} className="mr-2 text-emerald-600" />
                手机扫码体验
              </button>
            </div>
          </div>

          {/* 动态图标展示区 */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end z-10">
            {/* 装饰性光晕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>
            <FloatingBusGraphic />
          </div>
        </div>
      </section>

      {/* 特色功能区域 */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">专注体验，化繁为简</h2>
            <p className="text-slate-600">去掉所有多余的广告和复杂的设置，只为您提供最纯粹、最快速的巴士查询服务。</p>
          </div>

          {/* --- 新增：App 界面截图横向展示行 --- */}
          <div 
            className="flex overflow-x-auto gap-6 md:gap-8 pb-12 mb-8 snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0 lg:justify-center [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* 截图 1 */}
            <div className="relative shrink-0 snap-center w-[260px] h-[540px] rounded-[2.5rem] bg-slate-50 shadow-2xl shadow-emerald-900/10 border-[8px] border-white overflow-hidden group flex items-center justify-center">
              <span className="absolute text-slate-400 text-sm font-medium z-0">Waiting Hall (本地应用后显示)</span>
              <img 
                src="./image_2264f0.png" 
                alt="首页截图" 
                className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                onError={(e) => { e.target.style.opacity = 0; }}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem] pointer-events-none z-20"></div>
            </div>

            {/* 截图 2 */}
            <div className="relative shrink-0 snap-center w-[260px] h-[540px] rounded-[2.5rem] bg-slate-50 shadow-2xl shadow-emerald-900/10 border-[8px] border-white overflow-hidden group flex items-center justify-center">
              <span className="absolute text-slate-400 text-sm font-medium z-0">Search Stop (本地应用后显示)</span>
              <img 
                src="./image_2267d3.jpg" 
                alt="搜索截图" 
                className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                onError={(e) => { e.target.style.opacity = 0; }}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem] pointer-events-none z-20"></div>
            </div>

            {/* 截图 3 */}
            <div className="relative shrink-0 snap-center w-[260px] h-[540px] rounded-[2.5rem] bg-slate-50 shadow-2xl shadow-emerald-900/10 border-[8px] border-white overflow-hidden group flex items-center justify-center">
              <span className="absolute text-slate-400 text-sm font-medium z-0">Saved Stops (本地应用后显示)</span>
              <img 
                src="./image_2267f2.png" 
                alt="收藏截图" 
                className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                onError={(e) => { e.target.style.opacity = 0; }}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem] pointer-events-none z-20"></div>
            </div>

            {/* 截图 4 */}
            <div className="relative shrink-0 snap-center w-[260px] h-[540px] rounded-[2.5rem] bg-slate-50 shadow-2xl shadow-emerald-900/10 border-[8px] border-white overflow-hidden group flex items-center justify-center">
              <span className="absolute text-slate-400 text-sm font-medium z-0">Search Hint (本地应用后显示)</span>
              <img 
                src="./image_226810.png" 
                alt="提示截图" 
                className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                onError={(e) => { e.target.style.opacity = 0; }}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem] pointer-events-none z-20"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-200 transition-colors group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">实时精准计时</h3>
              <p className="text-slate-600 leading-relaxed">
                直观展示 "NOW", "NEXT", "LATER" 三班巴士的到站时间。独特的进度条设计，车辆位置一目了然。
              </p>
            </div>

            {/* Feature 2 (PWA 优化) */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-200 transition-colors group hover:shadow-xl hover:shadow-emerald-100/50">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">免安装，即点即用</h3>
              <p className="text-slate-600 leading-relaxed">
                采用先进的 H5 / PWA 技术，无需前往应用商店下载。打开网页即可使用，更可直接添加到手机桌面，享受原生级顺滑体验。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-200 transition-colors group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">个性化候车厅</h3>
              <p className="text-slate-600 leading-relaxed">
                您可以自由添加、重命名和排序常去的公交站（如：Home, SengKang），打造属于您的私人候车大厅。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 PWA 安装指南 CTA */}
      <section id="download" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-emerald-50/80 -z-10"></div>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-6 shadow-inner">
            <Zap size={32} />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">即刻体验，无需等待下载</h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Bus Comming 是一款渐进式网络应用 (PWA)。只需简单的两步，您就能将它永久保存在手机桌面上，享受零延迟、无广告的原生级查车体验。
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
            {/* iOS 教程 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Apple size={24} className="mr-2 text-slate-700" /> 苹果 iOS 用户
              </h3>
              <ol className="space-y-5 text-slate-600">
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mr-3 shrink-0">1</span>
                  <p>在 Safari 浏览器中打开 <span className="font-semibold text-slate-900">Bus Comming</span></p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mr-3 shrink-0">2</span>
                  <p>点击底部工具栏的 <Share size={18} className="inline mx-1 text-blue-500" /> <strong>分享</strong> 按钮</p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mr-3 shrink-0">3</span>
                  <p>下拉列表，选择 <strong>"添加到主屏幕"</strong></p>
                </li>
              </ol>
            </div>

            {/* Android 教程 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Smartphone size={24} className="mr-2 text-emerald-600" /> 安卓 Android 用户
              </h3>
              <ol className="space-y-5 text-slate-600">
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mr-3 shrink-0">1</span>
                  <p>在 Chrome 浏览器中打开 <span className="font-semibold text-slate-900">Bus Comming</span></p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mr-3 shrink-0">2</span>
                  <p>点击右上角的 <strong>菜单 (⋮)</strong> 按钮</p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold mr-3 shrink-0">3</span>
                  <p>在列表中选择 <strong>"添加到主屏幕"</strong></p>
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-14">
            <button className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1">
              <ExternalLink size={20} className="mr-2" />
              立即在浏览器中打开
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Bus size={24} className="text-emerald-500" />
            <span className="text-xl font-bold text-white">Bus Comming</span>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-emerald-400 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">服务条款</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">联系我们</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 text-center text-sm opacity-60">
          &copy; {new Date().getFullYear()} Bus Comming. All rights reserved. Data provided by LTA DataMall.
        </div>
      </footer>

    </div>
  );
}