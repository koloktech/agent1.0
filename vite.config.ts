import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  //Tbhis must match your GitHub repository name exactly, with slashes
  base: '/SOLARIS1/', 
});