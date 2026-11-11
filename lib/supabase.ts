import { createClient } from '@supabase/supabase-js';

// 브라우저 환경(Vite / Next.js / Create React App 등) 환경변수 안전 참조
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_ANON_KEY) ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Security Warning] Supabase URL 또는 Anon Key가 설정되지 않았습니다. .env 환경변수를 확인하세요.'
  );
}

/**
 * 보안 강화된 Supabase Client 인스턴스
 * - flowType: 'pkce' (인증 코드 가로채기 공격 방지 표준)
 * - autoRefreshToken: true (만료 토큰 자동 갱신)
 * - persistSession: true (안전한 세션 저장소 활용)
 * - detectSessionInUrl: true (OAuth 리다이렉트 콜백 감지)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
