# 🎈 디지털 롤링페이퍼 (Interactive Rolling Paper)

실시간으로 포스트잇을 붙이고 자유롭게 드래그하며 마음을 전하는 **인터랙티브 디지털 롤링페이퍼 웹 서비스**입니다.

---

## ✨ 주요 기능

### 1. 감성적인 로그인 시작 화면 (`LoginPage`)
- Shadcn/ui 스타일의 모던한 로그인 다이얼로그 카드
- **Google 소셜 로그인** (OAuth 2.0 PKCE Flow)
- **⚡ 1초 테스트 로그인 (게스트)** (외부 설정 없이 즉시 체험 가능)
- 모바일 친화적인 소셜 로그인 버튼 세로 스택 (`react-icons` 공식 로고 적용)

### 2. 롤링페이퍼 스튜디오 (`CreateBoardPage`)
- **새 보드 만들기**: 받는 사람 이름, 제목, 4가지 감성 배경 테마(따뜻한 노을, 라벤더 드림, 민트 프레시, 클래식 크림) 선택 후 즉시 생성
- **보드 목록 관리**: 기존에 생성된 롤링페이퍼 보드 카드 목록 열람 및 원클릭 입장

### 3. 인터랙티브 보드 캔버스 (`App`)
- **Framer Motion 물리 드래그**: 
  - 보드 경계 밖 이탈 방지(`dragConstraints`) 및 탄성 튕김(`dragElastic`)
  - 드래그 시 확대(`scale: 1.08`), 그림자 확대 및 최상위 레이어(`z-index: 999`) 적용
  - 마우스를 놓는 순간(`onDragEnd`) 변경된 좌표가 Supabase에 자동 저장
- **5가지 파스텔 컬러 & 150자 작성 모달**:
  - 옐로우, 핑크, 그린, 블루, 퍼플 파스텔 컬러 팔레트
  - 실시간 글자 수 카운터 피드백 (130자/149자/150자 색상 경고)
- **⚡ 실시간(Realtime) 동기화**:
  - Supabase WebSocket 채널을 통해 다른 사용자가 작성, 이동, 삭제한 포스트잇이 **새로고침 없이 0.1초 만에 화면에 실시간 반영**
- **✍️ 포스트잇 인라인 수정 기능**:
  - 포스트잇을 **더블클릭**하면 수정 모드로 전환
  - 작성자 별명, 본문 내용, 5가지 색상 실시간 변경 가능
  - 단축키 지원 (`Ctrl+Enter`로 저장, `Esc`로 취소)

---

## 🛠️ 기술 스택

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animation & Physics**: Framer Motion
- **Icons**: Lucide React, React Icons
- **Backend & Database**: Supabase (PostgreSQL, GoTrue Auth, Realtime WebSocket)

---

## 🚀 시작하기

### 1. 저장소 클론 및 패키지 설치
```bash
git clone https://github.com/jihunyangAI/inter_board.git
cd inter_board
npm install
```

### 2. 환경변수 설정
`.env.example`을 복사하여 `.env` 파일을 생성하고 Supabase 프로젝트 정보를 입력합니다:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.
