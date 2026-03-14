import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/gold-tracker/', // เปลี่ยนให้ตรงกับชื่อ Repository ของคุณ
})