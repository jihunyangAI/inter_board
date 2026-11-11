import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * 구글 소셜 로그인 (OAuth 2.0 PKCE Flow)
 * @param redirectTo 로그인 완료 후 복귀할 안전한 URL (기본값: 현재 오리진)
 */
export async function signInWithGoogle(redirectTo?: string) {
  try {
    const targetRedirectUrl = redirectTo || `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Auth Security] 구글 로그인 요청 실패:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    const error = err as AuthError;
    console.error('[Auth Security] 예기치 못한 인증 오류:', error);
    return { data: null, error };
  }
}

/**
 * 사용자 로그아웃 및 브라우저 세션 정리
 * - 클라이언트 측 Access Token / Refresh Token 즉시 폐기
 * @param scope 'global' | 'local' | 'others' (기본: 'global' - 모든 활성 세션 해제)
 * @returns {Promise<{ error: AuthError | null }>}
 */
export async function signOut(scope: 'global' | 'local' | 'others' = 'global') {
  try {
    const { error } = await supabase.auth.signOut({ scope });
    if (error) {
      console.error('[Auth Security] 로그아웃 실패:', error.message);
      return { error };
    }
    return { error: null };
  } catch (err) {
    const error = err as AuthError;
    console.error('[Auth Security] 로그아웃 예외 발생:', error);
    return { error };
  }
}

/**
 * 현재 로그인된 사용자 정보 조회
 * @returns {Promise<User | null>}
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * 원클릭 테스트/게스트 로그인 (외부 콘솔 설정 필요 없음)
 */
export async function signInAsGuest() {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('[Auth Security] 게스트 로그인 실패:', error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as AuthError };
  }
}

/**
 * @returns {Promise<Session | null>}
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * 실시간 인증 상태 변경 감지 리스너 (React useEffect 연동용)
 * @param callback 인증 상태 변경 시 실행될 핸들러
 * @returns 구독 해제 함수(Unsubscribe)
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}
