import React, { useState } from 'react';
import { supabase } from 'lib/supabase';
import type { CardColor, PostItMessage } from '../types';

interface NewPostItModalProps {
  boardId: string;
  defaultSender?: string;
  onClose: () => void;
  onCreated: (newPost: PostItMessage) => void;
}

const PALETTES: { id: CardColor; label: string; bg: string; border: string }[] = [
  { id: 'yellow', label: '옐로우', bg: 'bg-[#FEF9C3]', border: 'border-[#FDE047]' },
  { id: 'pink',   label: '핑크',   bg: 'bg-[#FCE7F3]', border: 'border-[#F9A8D4]' },
  { id: 'green',  label: '그린',   bg: 'bg-[#DCFCE7]', border: 'border-[#86EFAC]' },
  { id: 'blue',   label: '블루',   bg: 'bg-[#E0F2FE]', border: 'border-[#7DD3FC]' },
  { id: 'purple', label: '퍼플',   bg: 'bg-[#F3E8FF]', border: 'border-[#D8B4FE]' },
];

export const NewPostItModal: React.FC<NewPostItModalProps> = ({
  boardId,
  defaultSender = '',
  onClose,
  onCreated,
}) => {
  const [senderName, setSenderName] = useState(defaultSender);
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<CardColor>('yellow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 글자 수 계산
  const charCount = content.length;
  const maxChars = 150;

  // 글자 수 색상 규칙 (기획서 2.2)
  const getCounterStyle = () => {
    if (charCount >= maxChars) return 'text-rose-500 font-bold';
    if (charCount >= 131) return 'text-amber-500 font-semibold';
    return 'text-gray-400';
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setContent(text);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !senderName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 보드 중앙 영역 랜덤 오프셋 부여 (겹침 방지)
      const randomX = Math.floor(Math.random() * 300) + 100;
      const randomY = Math.floor(Math.random() * 250) + 100;
      const randomRotation = Number(((Math.random() * 6) - 3).toFixed(1)); // -3.0 ~ +3.0도

      const payload = {
        board_id: boardId,
        sender_name: senderName.trim(),
        content: content.trim(),
        card_color: selectedColor,
        font_style: 'font-sans',
        metadata: {
          x: randomX,
          y: randomY,
          rotation: randomRotation,
        },
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert('포스트잇 등록 실패: ' + error.message);
        return;
      }

      if (data) {
        onCreated(data as PostItMessage);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>📝</span> 새 포스트잇 붙이기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. 색상 선택 팔레트 (5가지 파스텔) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              포스트잇 색상
            </label>
            <div className="flex gap-2">
              {PALETTES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedColor(p.id)}
                  className={`w-9 h-9 rounded-lg border-2 transition-all flex items-center justify-center ${p.bg} ${p.border} ${
                    selectedColor === p.id ? 'ring-2 ring-indigo-500 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={p.label}
                >
                  {selectedColor === p.id && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 작성자 닉네임 (최대 12자) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              작성자 이름 (최대 12자)
            </label>
            <input
              type="text"
              required
              maxLength={12}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="예: 민지, 익명의 응원자"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200"
            />
          </div>

          {/* 3. 본문 내용 (최대 150자) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">
                메시지 본문
              </label>
              <span className={`text-xs ${getCounterStyle()}`}>
                {charCount} / {maxChars}자
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={maxChars}
              value={content}
              onChange={handleContentChange}
              placeholder="마음을 담은 응원이나 축하 메시지를 적어주세요 :)"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 resize-none leading-relaxed"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || !senderName.trim()}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold shadow transition"
            >
              {isSubmitting ? '붙이는 중...' : '보드에 붙이기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
