import axios from 'axios';

// ใช้ Environment Variable สำหรับ API URL และ Key (ถ้ามี)
const API_BASE_URL = 'https://api.example.com/gold'; // เปลี่ยนเป็น API จริงที่คุณใช้งาน

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    // 'x-access-token': import.meta.env.VITE_GOLD_API_KEY
    'Content-Type': 'application/json'
  }
});

export const fetchLatestGoldPrice = async () => {
  try {
    // ในสถานการณ์จริง: const response = await apiClient.get('/latest');
    // เพื่อการทดสอบ เราจะ Mock ข้อมูลกลับไป
    return {
      price: 2350.45, // USD ต่อออนซ์
      currency: 'USD',
      updatedAt: new Date().toISOString(),
      historicalPrices: [2300, 2315, 2340, 2335, 2350.45] // ข้อมูลย้อนหลังจำลอง 5 วัน
    };
  } catch (error) {
    console.error('Failed to fetch gold price:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลราคาทองคำได้ในขณะนี้');
  }
};