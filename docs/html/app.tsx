import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Bell, 
  Bus, 
  Filter,
  Loader2,
  X,
  AlertCircle,
  Heart,
  Navigation2,
  RotateCw
} from 'lucide-react';

// --- Constants & API Setup ---
const apiKey = "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [stations, setStations] = useState([
    { id: '1', name: 'Home 371', code: '1001', routes: '371路' },
    { id: '2', name: '公司附近', code: '2055', routes: '791路, 987路' }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addStation = (newStation) => {
    setStations([...stations, { ...newStation, id: Date.now().toString() }]);
    setIsAddModalOpen(false);
    notify("站点已成功加入收藏 ✨");
  };

  const removeStation = (id) => {
    setStations(stations.filter(s => s.id !== id));
    notify("站点已从清单中移除", "warning");
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 font-sans pb-28 selection:bg-emerald-100">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-md">
        <div className="bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-b-[40px] shadow-lg shadow-emerald-900/10 border-b border-white/20">
          <div className="max-w-md mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center">
                <Bus className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tight leading-none flex items-baseline">
                  <span className="text-emerald-100 mr-1.5">SG</span>
                  <span>公交出行</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-90">实时监控中</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="bg-white/10 p-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                <Search size={18} className="text-white" />
              </button>
              <button className="bg-white/10 p-3 rounded-2xl border border-white/10 relative hover:bg-white/20 transition-all">
                <Bell size={18} className="text-white" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-400 rounded-full border-2 border-emerald-500"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 通知浮层 */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-sm font-bold bg-emerald-600 text-white animate-in fade-in slide-in-from-top-4">
          {notification.message}
        </div>
      )}

      {/* 主内容区 */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'home' && <HomeView stations={stations} />}
        {activeTab === 'manage' && (
          <ManageView 
            stations={stations} 
            onRemove={removeStation} 
            onOpenAdd={() => setIsAddModalOpen(true)} 
          />
        )}
        {activeTab === 'query' && <QueryView />}
      </main>

      {/* 底部导航栏 */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-30">
        <nav className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-[32px] flex justify-around items-center py-2 px-3">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Clock size={22} />} 
            label="到站" 
          />
          <NavButton 
            active={activeTab === 'query'} 
            onClick={() => setActiveTab('query')} 
            icon={<Search size={22} />} 
            label="发现" 
          />
          <NavButton 
            active={activeTab === 'manage'} 
            onClick={() => setActiveTab('manage')} 
            icon={<Settings size={22} />} 
            label="管理" 
          />
        </nav>
      </div>

      {isAddModalOpen && (
        <AddStationModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={addStation} 
        />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 py-2 px-6 rounded-2xl flex-1 ${
      active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
    }`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
    <span className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
  </button>
);

const HomeView = ({ stations }) => {
  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm border border-slate-200 flex items-center justify-center mb-6">
          <MapPin size={32} className="text-emerald-200" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">暂无收藏站点</h3>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Navigation2 size={18} className="text-emerald-500 fill-emerald-500" />
          候车大厅
        </h2>
      </div>
      
      {stations.map(station => (
        <div key={station.id} className="space-y-4">
          {station.routes.split(',').map((route, idx) => (
            <EnhancedBusCard key={idx} route={route.trim()} stationName={station.name} />
          ))}
        </div>
      ))}
    </div>
  );
};

// 强化边界的卡片
const EnhancedBusCard = ({ route, stationName }) => {
  const mainTrip = { min: 2, sec: 3, time: '11:27:56', status: '快到了' };
  const nextTrip = { min: 14, sec: 20, arrival: '11:40:13' };
  const lastTrip = { min: 24, sec: 29, arrival: '11:50:22' };

  const progress = 85; 

  return (
    <div className="bg-white rounded-[24px] shadow-md border border-slate-200 overflow-hidden transition-all hover:shadow-lg hover:border-emerald-200">
      {/* 头部 */}
      <div className="bg-emerald-500 px-5 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black leading-none">{route}</h3>
          <span className="text-[11px] font-bold opacity-80 border-l border-white/30 pl-3">{stationName}</span>
        </div>
        <button className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
          <RotateCw size={14} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm"></span>
              <span className="text-emerald-700 text-[10px] font-black uppercase tracking-widest">当前班次</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{mainTrip.min}</span>
              <span className="text-sm font-bold text-slate-800 mr-2">分</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{mainTrip.sec}</span>
              <span className="text-sm font-bold text-slate-800">秒</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <span className="bg-orange-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-black shadow-md shadow-orange-100 uppercase tracking-widest">
              {mainTrip.status}
            </span>
            <div>
              <p className="text-[9px] text-slate-400 font-black flex items-center justify-end gap-1 uppercase">
                <MapPin size={10} className="text-rose-400" /> GPS 定位: {mainTrip.time}
              </p>
            </div>
          </div>
        </div>

        {/* 公交移动感进度条 */}
        <div className="relative mb-6 mt-2 px-1">
          <div className="h-2 w-full bg-slate-100 rounded-full border border-slate-200/50 shadow-inner"></div>
          <div 
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-emerald-100 to-emerald-400 rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
          <div 
            className="absolute -top-3.5 transition-all duration-1000 flex flex-col items-center"
            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-orange-500 p-1.5 rounded-md shadow-md border border-white">
              <Bus size={12} className="text-white fill-current" />
            </div>
          </div>
        </div>

        {/* 班次列表 */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-3 items-center px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">下一趟</span>
            <span className="text-sm font-black text-slate-700 text-center font-mono tracking-tight">{nextTrip.min}m {nextTrip.sec}s</span>
            <div className="flex items-center justify-end gap-1.5">
              <Clock size={10} className="text-slate-300" />
              <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{nextTrip.arrival}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">下下趟</span>
            <span className="text-sm font-black text-slate-700 text-center font-mono tracking-tight">{lastTrip.min}m {lastTrip.sec}s</span>
            <div className="flex items-center justify-end gap-1.5">
              <Clock size={10} className="text-slate-300" />
              <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{lastTrip.arrival}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageView = ({ stations, onRemove, onOpenAdd }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center px-1 mt-2">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          站点收藏
        </h2>
        {/* 优化后的“新增”按钮：更明显的阴影和圆润的胶囊形 */}
        <button 
          onClick={onOpenAdd}
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-full font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span className="text-sm tracking-wide">新增站点</span>
        </button>
      </div>

      <div className="grid gap-4">
        {stations.map(station => (
          <div key={station.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-md flex justify-between items-center hover:shadow-lg transition-all hover:border-emerald-200 group">
            <div className="space-y-1.5">
              <h3 className="font-black text-lg text-slate-800 leading-none">{station.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">站台代码: {station.code}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {station.routes.split(',').map((r, i) => (
                  <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl font-black border border-emerald-100">
                    {r.trim()}
                  </span>
                ))}
              </div>
            </div>
            <button 
              onClick={() => onRemove(station.id)}
              className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all border border-slate-100"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const QueryView = () => {
  const [queryCode, setQueryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const fetchBusData = async () => {
    if (!queryCode.trim()) return;
    setLoading(true);
    try {
      const systemPrompt = `你是一个公交API。返回JSON包含: stationName, data (包含 route, times 分钟数组)。`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Query code ${queryCode}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setResults(JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
      <h2 className="text-lg font-black text-slate-800 px-1">全城搜索</h2>
      
      <div className="bg-white p-2 rounded-[24px] shadow-md border border-slate-200 flex items-center">
        <div className="pl-3 text-emerald-500"><Search size={22} /></div>
        <input 
          type="text" 
          placeholder="请输入 5 位站码..."
          value={queryCode}
          onChange={(e) => setQueryCode(e.target.value)}
          className="flex-1 px-3 py-3 bg-transparent border-none focus:ring-0 outline-none font-black text-base text-slate-700 placeholder:text-slate-300"
        />
        <button 
          onClick={fetchBusData}
          disabled={loading}
          className="bg-emerald-600 text-white h-11 px-6 rounded-2xl font-black text-sm active:scale-95 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "查询"}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-emerald-600 tracking-widest px-2 uppercase text-center">{results.stationName} 实时状态</p>
          <div className="space-y-4">
            {results.data.map((item, idx) => (
              <EnhancedBusCard key={idx} route={item.route} stationName={results.stationName} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AddStationModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', code: '', routes: '' });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 border-t border-white">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-emerald-50/20">
          <h2 className="font-black text-2xl text-slate-800 tracking-tight">添加收藏</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm text-slate-300"><X size={24} /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6 pb-12">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">站点名称</label>
            <input required type="text" className="w-full p-5 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-emerald-400 outline-none font-black text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">站码 (5位)</label>
            <input required type="text" className="w-full p-5 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-emerald-400 outline-none font-black text-lg" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">关注路线</label>
            <input type="text" className="w-full p-5 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-emerald-400 outline-none font-black text-lg" value={formData.routes} onChange={e => setFormData({...formData, routes: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[28px] font-black shadow-2xl shadow-emerald-200 active:scale-95 transition-all mt-4 uppercase">确认收藏</button>
        </form>
      </div>
    </div>
  );
};

export default App;