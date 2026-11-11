import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { Sparkles, X, Heart } from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from 'lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // 구글 로그인 처리
  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setIsLoading(null);
    }
  };

  // 1초 테스트/게스트 로그인 처리
  const handleGuestLogin = async () => {
    setIsLoading('guest');
    try {
      const { data, error } = await signInAsGuest();
      if (!error && data) {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }
    } finally {
      setIsLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        {/* 1. Backdrop (배경 블러 오버레이) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        />

        {/* 2. Shadcn/ui 스타일의 다이얼로그 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 z-10 select-none"
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 상단 감성 일러스트 배지 */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100/80 mb-4 shadow-inner">
            <span className="text-2xl animate-bounce">💌</span>
          </div>

          {/* 텍스트 영역: 한국 사용자 친화적 타이포그래피 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-semibold mb-2">
              <Heart className="w-3 h-3 fill-rose-500" />
              <span>작성자 인증 필요</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              로그인하고 마음을 남겨보세요
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              따뜻한 한마디가 소중한 추억이 됩니다.<br />
              간편하게 로그인하고 축하의 글을 남겨보세요!
            </p>
          </div>

          {/* 3. 소셜 로그인 버튼 영역 (세로 스택 새로배치) */}
          <div className="space-y-2.5">
            {/* 구글 로그인 버튼 (메인) */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
              className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-60"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Google 계정으로 계속하기</span>
              {isLoading === 'google' && (
                <span className="absolute right-4 text-slate-400 text-[11px] animate-pulse">
                  연결중...
                </span>
              )}
            </button>

            {/* 1초 테스트 / 게스트 로그인 버튼 */}
            <button
              onClick={handleGuestLogin}
              disabled={isLoading !== null}
              className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>1초 만에 바로 작성하기 (게스트)</span>
              {isLoading === 'guest' && (
                <span className="absolute right-4 text-slate-300 text-[11px] animate-pulse">
                  생성중...
                </span>
              )}
            </button>

            {/* 카카오 버튼 (보조 안내용) */}
            <button
              type="button"
              onClick={() => alert('카카오는 현재 비즈앱 검수 중입니다. Google 또는 1초 테스트 로그인을 이용해 주세요!')}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] py-3 px-4 text-xs font-bold text-[#3C1E1E] opacity-90 transition-all hover:opacity-100 hover:bg-[#FDD835] active:scale-[0.98]"
            >
              <RiKakaoTalkFill className="w-5 h-5 text-[#3C1E1E]" />
              <span>카카오로 시작하기</span>
            </button>
          </div>

          {/* 4. 하단 약관 안내 문구 */}
          <p className="mt-5 text-center text-[11px] text-slate-400 leading-tight">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에<br />동의하는 것으로 간주됩니다.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
