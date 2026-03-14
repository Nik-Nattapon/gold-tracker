import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { fetchLatestGoldPrice } from './services/goldApi';
import { analyzeGoldTrend } from './utils/analyzer';
// Import Components จาก Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState([]); // State สำหรับเก็บข้อมูลกราฟ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLatestGoldPrice();
      setData(result);
      
      const trendAnalysis = analyzeGoldTrend(result.historicalPrices);
      setAnalysis(trendAnalysis);

      // แปลงข้อมูล historicalPrices ให้เป็น Object array สำหรับ Recharts
      const formattedChartData = result.historicalPrices.map((price, index) => ({
        time: `Day ${index + 1}`,
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
    loadData();
  }, [loadData]);

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

  // กำหนดสีของเส้นกราฟตาม Trend
  const chartColor = analysis?.trend === 'down' ? '#ef4444' : '#10b981';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gold Tracker</h1>
            <p className="text-slate-400 text-sm">Real-time Price & Analysis</p>
          </div>
          <button 
            onClick={loadData} 
            disabled={loading}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {loading && !data ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                <div className="h-32 bg-slate-200 rounded w-full mt-4"></div>
              </div>
            </div>
          ) : data && analysis && (
            <>
              {/* Price Section */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Current Price</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900">
                      ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-lg text-slate-500">/ oz</span>
                  </div>
                </div>
                {getTrendIcon(analysis.trend)}
              </div>

              {/* Chart Section */}
              <div className="h-48 w-full mt-4 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    {/* เส้น Grid แนวนอนบางๆ */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }} 
                      dy={10} 
                    />
                    <YAxis 
                      domain={['dataMin - 10', 'auto']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }} 
                      width={40}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      formatter={(value) => [`$${value}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={chartColor} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: chartColor, strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Analysis Section */}
              <div className="space-y-3 pt-4 border-t">
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
              
              <div className="text-xs text-slate-400 text-right">
                อัปเดตล่าสุด: {new Date(data.updatedAt).toLocaleTimeString('th-TH')}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;