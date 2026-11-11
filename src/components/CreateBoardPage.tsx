import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Sparkles, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import { supabase } from 'lib/supabase';
import { signOut } from 'lib/auth';
import type { Board } from '../types';
import type { User } from '@supabase/supabase-js';

interface CreateBoardPageProps {
  user: User;
  onSelectBoard: (board: Board) => void;
}

const THEMES = [
  { id: 'warm-sunset', label: '따뜻한 노을', bg: 'bg-amber-100 border-amber-300 text-amber-900', desc: '따뜻하고 포근한 웜톤' },
  { id: 'lavender-dream', label: '라벤더 드림', bg: 'bg-purple-100 border-purple-300 text-purple-900', desc: '신비롭고 우아한 퍼플' },
  { id: 'mint-fresh', label: '민트 프레시', bg: 'bg-emerald-100 border-emerald-300 text-emerald-900', desc: '생기 있고 산뜻한 민트' },
  { id: 'classic-cream', label: '클래식 크림', bg: 'bg-stone-100 border-stone-300 text-stone-900', desc: '차분하고 정갈한 베이지' },
];

export const CreateBoardPage: React.FC<CreateBoardPageProps> = ({
  user,
  onSelectBoard,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('warm-sunset');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  // 사용자 닉네임 추출
  const userNickname =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.nickname ||
    user.email?.split('@')[0] ||
    '사용자';

  // 기존 보드 목록 조회
  const fetchBoards = async () => {
    setIsLoadingBoards(true);
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRecentBoards(data as Board[]);
      }
    } finally {
      setIsLoadingBoards(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // 새 보드 생성 핸들러
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        recipient_name: recipientName.trim(),
        theme: selectedTheme,
        is_closed: false,
      };

      const { data, error } = await supabase
        .from('boards')
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert('보드 생성에 실패했습니다: ' + error.message);
        return;
      }

      if (data) {
        onSelectBoard(data as Board);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 flex flex-col font-sans select-none overflow-y-auto">
      {/* 1. 상단 글로벌 헤더 */}
      <header className="h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎈</span>
          <span className="text-base font-extrabold text-slate-800 tracking-tight">
            내 롤링페이퍼 스튜디오
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-lg">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="프로필"
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-xs font-semibold text-slate-700">
              {userNickname}님
            </span>
          </div>

          <button
            onClick={() => signOut()}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 transition font-medium"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* 인트로 배너 */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>로그인 완료</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              반가워요, {userNickname}님! 🎉
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/90 leading-relaxed">
              새로운 롤링페이퍼 보드를 생성하여 사람들과 따뜻한 메시지를 나눠보세요.
            </p>
          </div>
          <span className="absolute right-4 bottom-2 text-7xl sm:text-8xl opacity-20 pointer-events-none">
            🎁
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* A. 새 보드 만들기 폼 (좌측 7컬럼) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">
                새 롤링페이퍼 만들기
              </h3>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-5">
              {/* 받는 사람 이름 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  누구에게 보내는 롤링페이퍼인가요? <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="예: 김철수 팀장님, 소중한 지민이, 우리 3반 친구들"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* 롤링페이퍼 제목 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  롤링페이퍼 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 🎂 40번째 생신을 진심으로 축하드립니다!"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              {/* 테마 선택 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  배경 테마 선택
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${theme.bg} ${
                        selectedTheme === theme.id
                          ? 'ring-2 ring-indigo-600 scale-[1.02] shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{theme.label}</span>
                        {selectedTheme === theme.id && <span>✓</span>}
                      </div>
                      <p className="text-[11px] opacity-75 mt-0.5">{theme.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 생성 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting || !recipientName.trim() || !title.trim()}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? '보드 생성 중...' : '롤링페이퍼 생성하고 입장하기'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* B. 기존 롤링페이퍼 보드 목록 (우측 5컬럼) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>📂</span>
                <span>보드 목록 바로가기 ({recentBoards.length})</span>
              </h3>
              <button
                onClick={fetchBoards}
                className="text-xs text-indigo-600 hover:underline"
              >
                새로고침
              </button>
            </div>

            {isLoadingBoards ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-xs text-slate-400">
                보드 목록 불러오는 중...
              </div>
            ) : recentBoards.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-xs text-slate-400">
                아직 생성된 보드가 없습니다.<br />왼쪽에서 첫 번째 보드를 만들어보세요!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {recentBoards.map((board) => (
                  <motion.div
                    key={board.id}
                    whileHover={{ scale: 1.01, x: 2 }}
                    onClick={() => onSelectBoard(board)}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span className="truncate pr-2 group-hover:text-indigo-600 transition">
                        {board.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        To. {board.recipient_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>보드 열기</span>
                      </span>
                      <span className="text-indigo-500 font-semibold group-hover:translate-x-1 transition flex items-center gap-0.5">
                        <span>입장</span>
                        <span>→</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
