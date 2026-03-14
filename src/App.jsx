import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { fetchLatestGoldPrice } from './services/goldApi';
import { analyzeGoldTrend } from './utils/analyzer';

function App() {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
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
              </div>
            </div>
          ) : data && analysis && (
            <>
              {/* Price Section */}
              <div className="flex justify-between items-end border-b pb-6">
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

              {/* Analysis Section */}
              <div className="space-y-3">
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