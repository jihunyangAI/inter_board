# [기능명세서] 디지털 롤링페이퍼 보드 및 포스트잇 인터랙션

---

## 1. 개요 및 기술 스택

### 1.1 개요
본 문서는 디지털 롤링페이퍼 서비스의 핵심 기능인 **가상 보드 내 포스트잇 생성, 자유 드래그 이동 및 실시간(Realtime) 동기화, 사용자 인증(Kakao Auth) 및 권한 모델**에 대한 상세 명세서입니다.

### 1.2 기술 스택
- **Frontend Core**: React (TypeScript)
- **Styling**: Tailwind CSS
- **Animation & Gesture**: Framer Motion
- **Backend & Database & Auth**: Supabase (PostgreSQL + Realtime + GoTrue Auth)

---

## 2. UI/UX 규칙 및 디자인 가이드

### 2.1 포스트잇 색상 팔레트 (5가지 파스텔 톤)
텍스트 가독성과 부드러운 아날로그 감성을 보장하기 위해 5가지 파스텔 톤을 사용합니다.

| 컬러 테마명 | Tailwind Class (배경/보더/텍스트) | Hex Code (BG) | 권장 텍스트 색상 |
| :--- | :--- | :--- | :--- |
| **Pastel Yellow** | `bg-[#FEF9C3] border-[#FDE047] text-[#713F12]` | `#FEF9C3` | 딥 웜 그레이 / 브라운 |
| **Pastel Pink** | `bg-[#FCE7F3] border-[#F9A8D4] text-[#831843]` | `#FCE7F3` | 딥 로즈 |
| **Pastel Green** | `bg-[#DCFCE7] border-[#86EFAC] text-[#14532D]` | `#DCFCE7` | 딥 포레스트 |
| **Pastel Blue** | `bg-[#E0F2FE] border-[#7DD3FC] text-[#0C4A6E]` | `#E0F2FE` | 딥 네이비 |
| **Pastel Purple** | `bg-[#F3E8FF] border-[#D8B4FE] text-[#581C87]` | `#F3E8FF` | 딥 바이올렛 |

### 2.2 글자 수 제한 및 입력 인터랙션 규칙
- **작성자 닉네임**: 최대 12자 (공백 포함)
- **본문 내용**: 최소 2자 ~ **최대 150자** (공백 포함)
- **카운터 UI**:
  - 0 ~ 130자: 회색(`text-gray-400`)
  - 131 ~ 149자: 주황색 경고(`text-amber-500 font-semibold`)
  - 150자: 붉은색(`text-rose-500 font-bold`) 및 추가 입력 차단

### 2.3 보드 및 드래그(Drag) 인터랙션 규칙
- **드래그 허용 범위**: Framer Motion의 `dragConstraints={boardRef}` 적용, 보드 경계 밖 이탈 차단 (최소 여백 16px).
- **물리 반응**: `dragElastic={0.05}`, `dragMomentum={false}`.
- **z-index**: 기본 10~100, 드래그 시 `z-index: 999`, `scale: 1.05`, `shadow-2xl`.

---

## 3. 회원가입/로그인 및 접근 권한(Auth) 명세

### 3.1 사용자 역할(Role) 및 드래그 권한 정책
1. **보드 소유자 (Host)**: 보드 내 모든 포스트잇 이동/삭제 권한 보유.
2. **로그인 작성자 (Member)**: 본인이 작성한 포스트잇만 이동/수정/삭제 가능 (`user_id === currentUser.id`).
3. **비회원/게스트**: 읽기 가능, 권한 없는 포스트잇은 드래그 비활성화 (`drag={false}`, `cursor-default`).

### 3.2 인증 UI 플로우
- 상단 헤더 우측에 `[카카오 로그인]` 버튼 노출.
- 로그인 성공 시 프로필 썸네일과 닉네임, `[로그아웃]` 버튼 표시.
- 본인 포스트잇에는 '내 글' 뱃지 표시 및 드래그 활성화.

---

## 4. 데이터 플로우 및 Supabase 연동

### 4.1 포스트잇 작성 (Create)
1. 클라이언트 낙관적 UI 렌더링.
2. `supabase.from('message').insert([{ ..., user_id: auth.uid() }])` 실행.
3. Supabase Realtime을 통해 모든 구독자에게 실시간 전파.

### 4.2 포스트잇 이동 (Update/Drag)
1. `onDragStart` -> 로컬 확대 및 z-index 상승.
2. `onDrag` -> 60fps GPU 가속 트랜스폼 (DB 요청 없음).
3. `onDragEnd` -> 최종 위치 검증 후 `supabase.from('message').update({ position_x, position_y }).eq('id', id)` 1회 호출.
