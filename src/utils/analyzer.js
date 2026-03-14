/**
 * วิเคราะห์แนวโน้มราคาทองคำเบื้องต้นจากข้อมูลย้อนหลัง
 * @param {number[]} historicalPrices - Array ของราคาย้อนหลัง
 * @returns {Object} - ผลการวิเคราะห์ (trend, message, signal)
 */
export const analyzeGoldTrend = (historicalPrices) => {
  if (!historicalPrices || historicalPrices.length < 2) {
    return { trend: 'neutral', message: 'ข้อมูลไม่เพียงพอต่อการวิเคราะห์', signal: 'HOLD' };
  }

  const currentPrice = historicalPrices[historicalPrices.length - 1];
  const previousPrice = historicalPrices[0]; // เทียบกับวันแรกของรอบ
  const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  if (percentChange > 1.5) {
    return { 
      trend: 'up', 
      message: `ราคาปรับตัวขึ้น ${percentChange.toFixed(2)}% แนวโน้มขาขึ้น (Uptrend) อาจพิจารณาขายทำกำไรบางส่วน`, 
      signal: 'SELL' 
    };
  } else if (percentChange < -1.5) {
    return { 
      trend: 'down', 
      message: `ราคาปรับตัวลง ${percentChange.toFixed(2)}% แนวโน้มขาลง (Downtrend) อาจเป็นจังหวะทยอยสะสม`, 
      signal: 'BUY' 
    };
  } else {
    return { 
      trend: 'sideway', 
      message: `ราคาแกว่งตัวในกรอบแคบ (${percentChange.toFixed(2)}%) ควรรอดูทิศทางตลาด`, 
      signal: 'HOLD' 
    };
  }
};