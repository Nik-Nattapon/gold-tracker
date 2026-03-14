// src/services/api.js

// ตั้งค่าพื้นฐานของสินทรัพย์แต่ละประเภท
export const ASSET_CONFIG = {
  GOLD: { id: 'GOLD', name: 'Gold', symbol: 'XAU/USD', unit: 'oz', decimals: 2 },
  SILVER: { id: 'SILVER', name: 'Silver', symbol: 'XAG/USD', unit: 'oz', decimals: 2 },
  OIL: { id: 'OIL', name: 'WTI Crude', symbol: 'WTI/USD', unit: 'bbl', decimals: 2 },
  BTC: { id: 'BTC', name: 'Bitcoin', symbol: 'BTC/USD', unit: 'btc', decimals: 0 },
};

export const fetchAssetPrice = async (assetId) => {
  // จำลองการ Delay ของ Network
  await new Promise(resolve => setTimeout(resolve, 600));

  let basePrice;
  
  // กำหนดราคาตั้งต้นจำลองของแต่ละสินทรัพย์
  switch(assetId) {
    case 'GOLD': basePrice = 2350.45; break;
    case 'SILVER': basePrice = 28.30; break;
    case 'OIL': basePrice = 82.50; break;
    case 'BTC': basePrice = 64500; break;
    default: basePrice = 100;
  }

  // ฟังก์ชันสร้างข้อมูลกราฟย้อนหลังแบบสุ่มให้ดูสมจริง
  const generateMockHistory = (price, volatility) => {
    let history = [];
    let tempPrice = price * (1 - volatility); // เริ่มจากราคาที่ต่ำกว่านิดหน่อย
    for(let i=0; i<6; i++) {
      history.push(Number(tempPrice.toFixed(ASSET_CONFIG[assetId].decimals)));
      // สุ่มแกว่งขึ้นลงตามความผันผวนของแต่ละสินทรัพย์
      tempPrice = tempPrice + (Math.random() * (price * volatility * 2) - (price * volatility));
    }
    history.push(price); // วันล่าสุดคือราคาปัจจุบัน
    return history;
  };

  // กำหนดค่าความผันผวน (Bitcoin ผันผวนสุด)
  const volatility = assetId === 'BTC' ? 0.05 : 0.02;

  return {
    price: basePrice,
    currency: 'USD',
    updatedAt: new Date().toISOString(),
    historicalPrices: generateMockHistory(basePrice, volatility)
  };
};