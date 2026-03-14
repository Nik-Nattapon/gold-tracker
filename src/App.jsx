import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Coins, Bitcoin, Droplets, CircleDollarSign, Wallet } from 'lucide-react';
import { fetchAssetPrice, ASSET_CONFIG } from './services/api';
import { analyzeGoldTrend } from './utils/analyzer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [activeAsset, setActiveAsset] = useState('GOLD'); 
  
  // State สำหรับจัดการ Portfolio (ดึงค่าเริ่มต้นจาก LocalStorage)
  const [holdings, setHoldings] = useState(() => {
    const savedHoldings = localStorage.getItem('portfolio_holdings');
    return savedHoldings ? JSON.parse(savedHoldings) : {};
  });

  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // บันทึกข้อมูลลง LocalStorage อัตโนมัติเมื่อ holdings มีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('portfolio_holdings', JSON.stringify(holdings));
  }, [holdings]);

  const loadData = useCallback(async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssetPrice(assetId);
      setData(result);
      
      const trendAnalysis = analyzeGoldTrend(result.historicalPrices);
      setAnalysis(trendAnalysis);

      const formattedChartData = result.historicalPrices.map((price, index) => ({
        time: `D-${7 - index}`,
        price: price
      }));
      setChartData(formattedChartData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeAsset);
  }, [activeAsset, loadData]);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงในช่อง Input
  const handleHoldingChange = (e) => {
    const value = e.target.value;
    setHoldings(prev => ({
      ...prev,
      [activeAsset]: value
    }));
  };

  const getSignalColor = (signal) => {
    switch(signal) {
      case 'BUY': return 'bg-green-100 text-green-800 border-green-200';
      case 'SELL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="text-green-500 w-8 h-8" />;
      case 'down': return <TrendingDown className="text-red-500 w-8 h-8" />;
      default: return <Minus className="text-gray-500 w-8 h-8" />;
    }
  };

  const getAssetIcon = (id, className) => {
    switch(id) {
      case 'GOLD': return <CircleDollarSign className={className} />;
      case 'SILVER': return <Coins className={className} />;
      case 'OIL': return <Droplets className={className} />;
      case 'BTC': return <Bitcoin className={className} />;
      default: return <CircleDollarSign className={className} />;
    }
  };

  const currentConfig = ASSET_CONFIG[activeAsset];
  const chartColor = analysis?.trend === 'down' ? '#ef4444' : '#10b981';
  
  // คำนวณมูลค่าพอร์ตปัจจุบัน
  const currentAmount = holdings[activeAsset] || '';
  const portfolioValue = currentAmount ? (Number(currentAmount) * (data?.price || 0)) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Market Tracker
            </h1>
            <p className="text-slate-400 text-sm">Real-time Prices & Portfolio</p>
          </div>
          <button 
            onClick={() => loadData(activeAsset)} 
            disabled={loading}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Menu Navigation */}
        <div className="flex bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {Object.keys(ASSET_CONFIG).map((key) => (
            <button
              key={key}
              onClick={() => setActiveAsset(key)}
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors duration-200 border-b-2
                ${activeAsset === key 
                  ? 'text-slate-900 border-slate-900 bg-white' 
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'}`}
            >
              {getAssetIcon(key, "w-5 h-5")}
              {ASSET_CONFIG[key].name}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded w-1/2"></div>
              <div className="h-40 bg-slate-200 rounded w-full mt-4"></div>
            </div>
          ) : data && analysis && (
            <div className="animate-in fade-in duration-500 space-y-6">
              
              {/* Price Section */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    {currentConfig.symbol}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900">
                      ${data.price.toLocaleString(undefined, { minimumFractionDigits: currentConfig.decimals, maximumFractionDigits: currentConfig.decimals })}
                    </span>
                  </div>
                </div>
                {getTrendIcon(analysis.trend)}
              </div>

              {/* Chart Section */}
              <div className="h-48 w-full mt-4 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }} 
                      width={45}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value}`, 'Price']}
                      labelStyle={{ color: '#64748b', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={chartColor} 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, fill: chartColor, strokeWidth: 2, stroke: '#fff' }} 
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Portfolio Calculator Section (เพิ่มใหม่) */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <p className="text-sm text-indigo-900 font-semibold uppercase tracking-wide">My Holdings</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder={`จำนวน ${currentConfig.unit}`}
                      value={currentAmount}
                      onChange={handleHoldingChange}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <span className="text-sm font-medium text-slate-500 w-12">{currentConfig.unit}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-indigo-100/50">
                    <span className="text-sm text-slate-500 font-medium">มูลค่ารวม:</span>
                    <span className="text-lg font-bold text-indigo-700">
                      ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="space-y-3 pt-2">
                <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">AI Analysis</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSignalColor(analysis.signal)}`}>
                      SIGNAL: {analysis.signal}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {analysis.message}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 text-right mt-4">
                อัปเดตล่าสุด: {new Date(data.updatedAt).toLocaleTimeString('th-TH')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;