import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { Sparkles, Heart, Move, Palette, Users } from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from 'lib/auth';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setIsLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading('guest');
    try {
      const { data, error } = await signInAsGuest();
      if (!error && data) {
        if (onLoginSuccess) onLoginSuccess();
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50/60 via-rose-50/40 to-indigo-50/50 overflow-hidden font-sans select-none">
      {/* 배경 장식 원형 블러 효과 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* 중앙 메인 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* 서비스 로고 및 인트로 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-amber-200/80 shadow-sm text-xs font-semibold text-amber-700 mb-3">
            <span>🎈</span>
            <span>디지털 롤링페이퍼 서비스</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
            추억과 마음을 담는 공간
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            친구, 동료, 소중한 사람에게 특별한 롤링페이퍼를 선물하세요.
          </p>
        </div>

        {/* Shadcn/ui 스타일의 로그인 카드 */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 mb-3 shadow-inner">
              <span className="text-2xl animate-bounce">💌</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-semibold mb-1.5">
              <Heart className="w-3 h-3 fill-rose-500" />
              <span>간편하게 시작하기</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              로그인하고 마음을 남겨보세요
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              로그인 후 나만의 롤링페이퍼 보드를 직접 만들고 관리할 수 있습니다.
            </p>
          </div>

          {/* 소셜 로그인 버튼 세로 스택 (새로배치) */}
          <div className="space-y-3">
            {/* Google 로그인 */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
              className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-60"
            >
              <FcGoogle className="w-5 h-5 shrink-0" />
              <span>Google 계정으로 계속하기</span>
              {isLoading === 'google' && (
                <span className="absolute right-4 text-slate-400 text-[11px] animate-pulse">
                  연결중...
                </span>
              )}
            </button>

            {/* 1초 테스트 게스트 로그인 */}
            <button
              onClick={handleGuestLogin}
              disabled={isLoading !== null}
              className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>⚡ 1초 테스트 로그인 (게스트)</span>
              {isLoading === 'guest' && (
                <span className="absolute right-4 text-slate-300 text-[11px] animate-pulse">
                  입장중...
                </span>
              )}
            </button>

            {/* 카카오 버튼 (보조) */}
            <button
              type="button"
              onClick={() => alert('카카오는 현재 비즈앱 검수 중입니다. Google 또는 1초 테스트 로그인을 이용해 주세요!')}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] py-3.5 px-4 text-xs font-bold text-[#3C1E1E] opacity-90 transition-all hover:opacity-100 hover:bg-[#FDD835] active:scale-[0.98]"
            >
              <RiKakaoTalkFill className="w-5 h-5 text-[#3C1E1E] shrink-0" />
              <span>카카오로 시작하기</span>
            </button>
          </div>

          {/* 하단 약관 안내 */}
          <p className="mt-6 text-center text-[11px] text-slate-400 leading-tight">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>

        {/* 하단 핵심 기능 특징 피처 뱃지들 */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-slate-500 text-[11px]">
          <div className="bg-white/60 backdrop-blur rounded-xl p-2.5 border border-slate-200/60 shadow-xs flex flex-col items-center gap-1">
            <Move className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-700">자유 드래그</span>
            <span className="text-[10px] text-slate-400">포스트잇 이동</span>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-2.5 border border-slate-200/60 shadow-xs flex flex-col items-center gap-1">
            <Palette className="w-4 h-4 text-pink-500" />
            <span className="font-semibold text-slate-700">5가지 파스텔</span>
            <span className="text-[10px] text-slate-400">감성 컬러 팔레트</span>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-2.5 border border-slate-200/60 shadow-xs flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700">실시간 동기화</span>
            <span className="text-[10px] text-slate-400">Supabase DB</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
