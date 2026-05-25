# 하나부동산 매물장

공인중개사를 위한 모바일 최적화 매물 관리 웹앱.
PIN 잠금, 매물/문의 CRUD, 사진 관리, 주소 검색, 카카오톡 공유, 매물-문의 조건 매칭, 거래 일정 캘린더, 통계 대시보드 기능을 제공합니다.

**URL**: https://maemul-manager.vercel.app

## 완성된 기능

### 인증
- PIN 4자리 잠금 화면 (숫자 키패드, 진동 피드백)
- httpOnly 쿠키 세션, 미인증 시 `/lock`으로 리다이렉트

### 매물 관리
- 빌라/상가 매물 등록·수정·삭제
- 매물 상태 변경 (가능 → 계약중 → 완료)
- 상태별·타입별 필터링, 주소 검색, 보증금순/상태순 정렬
- 사진 업로드 (최대 3장, Supabase Storage)
- 카카오 주소 검색 (다음 우편번호 API) + 카카오맵 지도 표시 (등록/수정/상세)
- 카카오톡 매물 공유 (상세 페이지에서 공유 버튼)

### 문의 관리
- 문의 등록·수정·삭제
- 문의 상태 변경 (진행중 / 완료)
- 상태별 필터링, 이름/연락처 검색, 문의일순 정렬
- 희망 조건 입력 (거래유형, 보증금, 월세, 방수)

### 거래 일정 캘린더
- 월간 달력 뷰, 날짜 클릭 시 해당일 일정 목록 표시
- 일정 종류: 계약서 작성 / 입주일 / 잔금일 / 중도금 / 기타 (종류별 색상 배지)
- 일정 등록·수정·삭제, 매물 연결 (선택), 시간 지정 (선택)
- 월 이동 시 클라이언트 fetch (새로고침 없음)

### 통계 대시보드
- 이번 달 계약 건수 / 예상 수익 요약 카드
- 월별 계약 건수 막대그래프 (최근 3개월)
- 월별 예상 수익 막대그래프 (최근 3개월)
- 다가오는 잔금일 리스트
- 계약서 일정에서 거래유형(매매/전세/월세) 선택 후 금액 입력
- 2024 법정 상한요율 기반 최대중개보수 자동 산출 + 실제중개보수 입력
- 수익 귀속: 계약서 복비를 같은 매물의 잔금일 월에 집계

### 매물-문의 매칭
- 문의 상세 페이지에서 조건에 맞는 매물 자동 표시
- 매칭 기준: 거래유형, 보증금 범위, 월세 상한, 방수

### UI/UX
- 5060 사용자 대상 큰 글씨(16px+)·큰 버튼(52px) UI
- 모바일/태블릿 최적화 반응형 디자인
- 탭 기반 대시보드 (매물장 / 문의장 / 캘린더 / 통계)
- Toast 알림 (저장/수정/삭제 성공·실패 피드백)
- 저장 버튼 로딩 스피너
- 랜딩 페이지

## 기술 스택

- **프레임워크**: Next.js 14 (App Router) + TypeScript
- **DB / Storage**: Supabase (PostgreSQL + Storage)
- **UI**: Tailwind CSS + shadcn/ui
- **폼 관리**: react-hook-form + Zod
- **지도/주소**: 카카오맵 SDK + 다음 우편번호 API
- **차트**: recharts
- **배포**: Vercel

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public 키 |
| `APP_PIN` | 앱 잠금 해제 PIN (기본: `1234`) |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 JavaScript 앱 키 |

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 실제 값으로 수정

# 개발 서버 실행
npm run dev
```

`http://localhost:3000`에서 접속. 기본 PIN은 `1234`.

## Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 저장소 Import
2. Environment Variables에 위 4개 환경변수 추가
3. Deploy 클릭 → 이후 `main` push 시 자동 배포

### Supabase 설정

- Storage에 `property-photos` 버킷 생성 (public 접근 허용)
- RLS 정책에 `TO anon` INSERT/SELECT/DELETE 허용
- DB 테이블은 `supabase/migrations/` 폴더의 SQL 파일 참조

## 카카오 개발자센터 설정

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션 생성
2. **앱 키** → JavaScript 키 복사 → `NEXT_PUBLIC_KAKAO_JS_KEY`에 설정
3. **플랫폼** → Web 플랫폼 등록
   - `http://localhost:3000` (로컬 개발)
   - `https://maemul-manager.vercel.app` (프로덕션)
4. **카카오맵** → 활성화 (Kakao Maps API 사용 설정)
