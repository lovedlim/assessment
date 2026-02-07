import { createClient } from '@supabase/supabase-js';

// Access environment variables via process.env (polyfilled in vite.config.ts)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

// 환경 변수가 설정되어 있는지 확인합니다.
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey;
};

// 환경 변수가 없으면 빈 값을 사용하여 초기화하되, 
// App.tsx에서 isSupabaseConfigured()를 통해 사전에 차단합니다.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);