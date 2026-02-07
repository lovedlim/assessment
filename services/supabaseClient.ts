import { createClient } from '@supabase/supabase-js';

// Vercel 환경 변수에서 값을 가져옵니다.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// 환경 변수가 설정되어 있는지 확인합니다.
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey;
};

if (!isSupabaseConfigured()) {
  console.warn("Supabase Environment Variables are missing. Falling back to LocalStorage (Demo Mode).");
}

// 환경 변수가 없으면 placeholder 값을 사용하여 클라이언트 초기화 시 에러(supabaseUrl is required)를 방지합니다.
// 실제 데이터 통신은 isSupabaseConfigured() 체크를 통해 제어되므로 이 클라이언트는 사용되지 않습니다.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);