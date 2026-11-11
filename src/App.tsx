import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from 'lib/supabase';
import { signOut, getCurrentUser, onAuthStateChange } from 'lib/auth';
import { PostItCard } from './components/PostItCard';
import { NewPostItModal } from './components/NewPostItModal';
import { LoginPage } from './components/LoginPage';
import { CreateBoardPage } from './components/CreateBoardPage';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import type { PostItMessage, Board } from './types';
import type { User } from '@supabase/supabase-js';

export const App: React.FC = () => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [messages, setMessages] = useState<PostItMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 1. 초기 사용자 세션 확인 및 실시간 인증 리스너
  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });

    const unsubscribe = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setCurrentBoard(null); // 로그아웃 시 보드 닫기
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. 선택된 보드의 포스트잇 메시지 목록 로드
  const loadMessages = useCallback(async () => {
    if (!currentBoard) return;
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('board_id', currentBoard.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('메시지 로드 실패:', error.message);
      } else if (data) {
        setMessages(data as PostItMessage[]);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentBoard]);

  useEffect(() => {
    if (currentBoard) {
      loadMessages();
    }
  }, [currentBoard, loadMessages]);

  // 3. Supabase Realtime 실시간 동기화
  useEffect(() => {
    if (!currentBoard) return;

    const channel = supabase
      .channel(`realtime_${currentBoard.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `board_id=eq.${currentBoard.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as PostItMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as PostItMessage;
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBoard]);

  // 포스트잇 로컬 삭제 핸들러
  const handleDeleted = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // 포스트잇 로컬 추가 핸들러
  const handleCreated = (newPost: PostItMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newPost.id)) return prev;
      return [...prev, newPost];
    });
  };

  // 사용자 닉네임 추출
  const userNickname =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nickname ||
    user?.email?.split('@')[0] ||
    '사용자';

  // 로딩 스피너 (초기 세션 검증 시)
  if (isAuthChecking) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm font-sans">
        로딩 중...
      </div>
    );
  }

  // ==========================================
  // [화면 1] 비로그인 상태: 시작 로그인 랜딩 화면
  // ==========================================
  if (!user) {
    return <LoginPage />;
  }

  // ==========================================
  // [화면 2] 로그인 상태 & 보드 미선택: 보드 생성 및 목록 화면
  // ==========================================
  if (!currentBoard) {
    return (
      <CreateBoardPage
        user={user}
        onSelectBoard={(selected) => setCurrentBoard(selected)}
      />
    );
  }

  // ==========================================
  // [화면 3] 선택된 롤링페이퍼 보드 캔버스 화면 (포스트잇 인터랙션)
  // ==========================================
  return (
    <div className="flex flex-col w-screen h-screen bg-slate-100 overflow-hidden font-sans">
      {/* 글로벌 상단 헤더 */}
      <header className="h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between z-30 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          {/* 보드 목록으로 돌아가기 버튼 */}
          <button
            onClick={() => setCurrentBoard(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition"
            title="보드 목록으로 돌아가기"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>보드 목록</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 leading-tight flex items-center gap-1.5">
              <span>{currentBoard.title}</span>
            </h1>
            <p className="text-xs text-slate-500">
              받는 사람: <span className="font-semibold text-slate-700">{currentBoard.recipient_name}</span> • 마우스로 포스트잇을 자유롭게 드래그해 보세요!
            </p>
          </div>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="flex items-center gap-2.5">
          {/* 새 포스트잇 추가 버튼 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <span>+</span>
            <span>포스트잇 붙이기</span>
          </button>

          {/* 새로고침 */}
          <button
            onClick={loadMessages}
            title="새로고침"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* 사용자 정보 및 로그아웃 */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-xs font-medium text-slate-700 max-w-[90px] truncate">
              {userNickname}
            </span>
            <button
              onClick={() => signOut()}
              title="로그아웃"
              className="text-slate-400 hover:text-rose-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 롤링페이퍼 캔버스 영역 (Framer Motion 드래그 바운더리) */}
      <main
        ref={boardRef}
        className="relative flex-1 w-full h-full overflow-hidden bg-[#FAF8F5] select-none"
        style={{
          backgroundImage: 'radial-gradient(#E2D9CE 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {isLoadingMessages ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            포스트잇 불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
            <span className="text-5xl animate-bounce">📌</span>
            <p className="text-sm font-medium text-slate-600 mt-2">
              아직 작성된 포스트잇이 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              {currentBoard.recipient_name}님을 위한 첫 번째 축하 메시지를 남겨보세요!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              + 첫 번째 포스트잇 붙이기
            </button>
          </div>
        ) : (
          messages.map((post) => (
            <PostItCard
              key={post.id}
              post={post}
              boardRef={boardRef}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </main>

      {/* 새 포스트잇 작성 모달 */}
      {isModalOpen && (
        <NewPostItModal
          boardId={currentBoard.id}
          defaultSender={userNickname}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};
