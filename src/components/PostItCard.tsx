import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, X } from 'lucide-react';
import { supabase } from 'lib/supabase';
import type { PostItMessage, CardColor } from '../types';

interface PostItCardProps {
  post: PostItMessage;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onDeleted?: (id: string) => void;
}

// 기획서 2.1에 정의된 5가지 파스텔 팔레트 스타일
const COLOR_STYLES: Record<CardColor, { bg: string; border: string; text: string; pin: string }> = {
  yellow: {
    bg: 'bg-[#FEF9C3]',
    border: 'border-[#FDE047]',
    text: 'text-[#713F12]',
    pin: 'bg-amber-400',
  },
  pink: {
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#F9A8D4]',
    text: 'text-[#831843]',
    pin: 'bg-pink-400',
  },
  green: {
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#86EFAC]',
    text: 'text-[#14532D]',
    pin: 'bg-emerald-400',
  },
  blue: {
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#7DD3FC]',
    text: 'text-[#0C4A6E]',
    pin: 'bg-sky-400',
  },
  purple: {
    bg: 'bg-[#F3E8FF]',
    border: 'border-[#D8B4FE]',
    text: 'text-[#581C87]',
    pin: 'bg-purple-400',
  },
};

const COLOR_OPTIONS: CardColor[] = ['yellow', 'pink', 'green', 'blue', 'purple'];

export const PostItCard: React.FC<PostItCardProps> = ({ post, boardRef, onDeleted }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editSenderName, setEditSenderName] = useState(post.sender_name);
  const [editContent, setEditContent] = useState(post.content);
  const [editColor, setEditColor] = useState<CardColor>((post.card_color as CardColor) || 'yellow');

  // 기본 좌표 및 회전각 추출
  const x = post.metadata?.x ?? 50;
  const y = post.metadata?.y ?? 50;
  const rotation = post.metadata?.rotation ?? 0;
  const currentColor = isEditing ? editColor : ((post.card_color as CardColor) || 'yellow');
  const style = COLOR_STYLES[currentColor] || COLOR_STYLES.yellow;

  // 글자 수 제한
  const maxChars = 150;
  const charCount = editContent.length;

  // 드래그 종료 시 최종 위치를 Supabase에 업데이트
  const handleDragEnd = async (_: any, info: any) => {
    if (isEditing) return; // 수정 모드일 때는 드래그 위치 업데이트 무시
    const updatedX = Math.round(x + info.offset.x);
    const updatedY = Math.round(y + info.offset.y);

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          metadata: {
            ...post.metadata,
            x: updatedX,
            y: updatedY,
            rotation: rotation,
          },
        })
        .eq('id', post.id);

      if (error) {
        console.error('위치 업데이트 실패:', error.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // 내용 및 별명 수정 저장
  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editSenderName.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          sender_name: editSenderName.trim(),
          content: editContent.trim(),
          card_color: editColor,
        })
        .eq('id', post.id);

      if (error) {
        alert('수정 실패: ' + error.message);
      } else {
        post.sender_name = editSenderName.trim();
        post.content = editContent.trim();
        post.card_color = editColor;
        setIsEditing(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditSenderName(post.sender_name);
    setEditContent(post.content);
    setEditColor((post.card_color as CardColor) || 'yellow');
    setIsEditing(false);
  };

  // 포스트잇 삭제
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('이 포스트잇을 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('messages').delete().eq('id', post.id);
    if (!error && onDeleted) {
      onDeleted(post.id);
    }
  };

  // 키보드 단축키 (수정 모드에서 Ctrl/Cmd + Enter 시 저장, Esc 시 취소)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <motion.div
      drag={!isEditing} // 수정 모드일 때는 드래그 비활성화하여 텍스트 입력 편의 제공
      dragConstraints={boardRef}
      dragElastic={0.05}
      dragMomentum={false}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isEditing ? 1.05 : 1,
        opacity: 1,
        x: x,
        y: y,
        rotate: isEditing ? 0 : rotation,
        zIndex: isEditing ? 999 : 10,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      whileHover={!isEditing ? { scale: 1.02, zIndex: 50 } : {}}
      whileDrag={{
        scale: 1.08,
        rotate: rotation + 2,
        zIndex: 999,
        cursor: 'grabbing',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
      onDragEnd={handleDragEnd}
      onDoubleClick={() => !isEditing && setIsEditing(true)}
      className={`absolute w-64 p-4 rounded-sm border shadow-md font-sans transition-shadow select-none ${
        isEditing ? 'cursor-default ring-2 ring-indigo-500 shadow-2xl' : 'cursor-grab'
      } ${style.bg} ${style.border} ${style.text}`}
      style={{ touchAction: 'none' }}
      title={!isEditing ? "더블클릭하여 내용/별명 수정" : undefined}
    >
      {/* 상단 핀 / 테이프 아날로그 감성 데코레이션 */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/10">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-1">
          <span className={`w-2.5 h-2.5 rounded-full ${style.pin} shadow-inner inline-block shrink-0`} />
          {isEditing ? (
            <input
              type="text"
              required
              maxLength={12}
              value={editSenderName}
              onChange={(e) => setEditSenderName(e.target.value)}
              placeholder="작성자 별명"
              className="w-full text-xs font-bold px-1.5 py-0.5 rounded bg-white/80 border border-black/15 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <span className="text-xs font-bold tracking-tight truncate max-w-[120px]">
              {post.sender_name}
            </span>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-1 shrink-0">
          {isUpdating && (
            <span className="text-[10px] text-gray-500 animate-pulse">저장중...</span>
          )}

          {!isEditing ? (
            <>
              {/* 수정 버튼 (더블클릭 외에도 버튼으로 수정 진입 가능) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="더블클릭 또는 클릭하여 수정"
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10 text-gray-500 hover:text-indigo-600 transition"
              >
                <Pencil className="w-3 h-3" />
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={handleDelete}
                title="포스트잇 삭제"
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10 text-xs text-gray-500 hover:text-red-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* 수정 모드 액션: 저장 & 취소 */}
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim() || !editSenderName.trim()}
                title="수정 저장 (Ctrl+Enter)"
                className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancelEdit}
                title="수정 취소 (Esc)"
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10 text-gray-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 본문 영역 (일반 모드 vs 수정 모드) */}
      {!isEditing ? (
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed min-h-[60px] font-medium">
          {post.content}
        </p>
      ) : (
        <div className="space-y-2" onKeyDown={handleKeyDown}>
          <textarea
            autoFocus
            rows={3}
            maxLength={maxChars}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="수정할 내용을 입력하세요"
            className="w-full text-xs font-medium p-2 rounded bg-white/90 border border-black/15 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
          />

          {/* 색상 변경 팔레트 & 글자 수 카운터 */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setEditColor(c)}
                  className={`w-4 h-4 rounded-full border transition-transform ${COLOR_STYLES[c].pin} ${
                    editColor === c ? 'scale-125 ring-2 ring-black/30' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c}
                />
              ))}
            </div>
            <span className={`text-[10px] ${charCount >= maxChars ? 'text-rose-600 font-bold' : 'opacity-60'}`}>
              {charCount}/{maxChars}
            </span>
          </div>
        </div>
      )}

      {/* 하단 메타정보 */}
      <div className="mt-2.5 pt-1 border-t border-black/5 flex justify-between items-center text-[10px] opacity-60">
        <span>
          {isEditing ? 'Ctrl+Enter로 저장' : '더블클릭하여 수정'}
        </span>
        <span className="font-mono">({x}, {y})</span>
      </div>
    </motion.div>
  );
};
