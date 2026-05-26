# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

- 서비스명: 하나부동산 매물장
- URL: https://maemul-manager.vercel.app
- 사용자: 5060 부모님 (큰 글씨/버튼, 직관적 UX)

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Supabase (DB + Storage)
- Tailwind CSS + shadcn/ui
- recharts (통계 차트)
- xlsx (SheetJS) — 엑셀 내보내기
- @ducanh2912/next-pwa — PWA (Service Worker, 오프라인 지원)
- Vercel 배포 (main push 시 자동 배포)

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

테스트 프레임워크 미설정. 변경 후 반드시 `npm run build`로 검증.

### DB Migration

```bash
supabase link --project-ref <project-ref>   # 최초 1회
supabase db push                             # 신규 마이그레이션 적용
supabase migration list                      # 적용 상태 확인
```

기존 마이그레이션이 이미 적용된 DB에서 `db push` 실패 시: `supabase migration repair --status applied <version>...`으로 기존 항목 표시 후 재실행.

## Architecture

### Data Flow

- **Server Components** → `/lib/queries/`로 데이터 조회
- **Server Actions** (`/lib/actions/`) → 생성/수정/삭제 후 `revalidatePath`
- **API Routes** (`/app/api/`) → FormData 파일 업로드, 사용자 인증
- **Supabase** 직접 클라이언트 사용 (ORM 없음), `/lib/supabase.ts` 싱글턴, `cache: "no-store"` 설정 (Next.js fetch 캐싱 방지)

### Key Directories

- `/lib/actions/` — Server Actions (property, inquiry, schedule, note, user, sharedLink, document CRUD)
- `/lib/queries/` — 서버 데이터 조회 함수 (검색/정렬/통계 지원)
- `/lib/validations/` — Zod 스키마
- `/lib/format/` — 가격 포맷, 라벨 매핑 유틸
- `/lib/utils/` — brokerageFee.ts (복비 자동산출 유틸)
- `/lib/export/` — xlsx.ts (매물/문의 엑셀 내보내기)
- `/lib/constants/` — filterRanges.ts (매물 필터 옵션 상수)
- `/components/forms/` — PropertyForm, InquiryForm, ScheduleForm, NoteForm, ImageUpload, AddressSearch, Field
- `/lib/auth.ts` — 서버 컴포넌트용 쿠키 파싱 유틸 (`getAuthUser()`)
- `/components/properties/` — PropertyFilter, FilterPanel, PropertyCard, PropertyListWithSelect, PropertyDetail, StatusChanger, StatusBadge, AddressMap, ShareButtons, DeleteButton, LockButton, ExportButton
- `/components/share/` — CreateShareLinkButton, SharedLinkManagement, PublicPropertyView, PublicPropertyCard (외부 공유)
- `/components/documents/` — DocumentUpload, DocumentList (매물별 서류 첨부)
- `/components/inquiries/` — InquiryCard, InquiryFilter, InquiryStatusChanger, DeleteInquiryButton, ExportButton
- `/components/notifications/` — NotificationBanner (인앱 다가오는 일정 알림)
- `/components/users/` — UserManagement, UserActions (admin 전용 사용자 관리)
- `/components/lock/` — PinPad, UserSelect, LoginFlow, SignupForm
- `/components/calendar/` — CalendarView, DaySchedules, ScheduleBadge, DeleteScheduleButton
- `/components/statistics/` — SummaryCards, ContractChart, RevenueChart, UpcomingBalances
- `/components/notes/` — NoteLayout, NoteList, NoteDetail, NoteBadge, DeleteNoteButton
- `/components/ui/` — shadcn 컴포넌트 + Toast, InfoRow, EmptyState, OfflineBanner, RegisterButton
- `/components/providers/` — OfflineFetchGuard (오프라인 시 mutation fetch 차단)
- `/hooks/useOnlineStatus.ts` — 온/오프라인 감지 훅 (useSyncExternalStore)
- `/types/` — TypeScript 타입 정의 (property.ts, schedule.ts, note.ts, user.ts, sharedLink.ts, document.ts)
- `/public/` — manifest.json, icons/ (PWA 아이콘), sw.js (빌드 생성)
- `/scripts/generate-icons.mjs` — PWA 아이콘 생성 스크립트 (@napi-rs/canvas)
- `/supabase/migrations/` — DB 마이그레이션 SQL

### Shared Components (리팩터링 추출)

- `components/forms/Field.tsx` — 폼 필드 래퍼 (label, error, required 표시). PropertyForm, InquiryForm, ScheduleForm, NoteForm 공유.
- `components/ui/InfoRow.tsx` — 상세 페이지 key-value 행. PropertyDetail, InquiryDetail 공유.
- `components/ui/EmptyState.tsx` — 빈 목록 표시. 메인 페이지 매물/문의/메모 탭 공유.
- `lib/utils.ts` → `cleanData()` — 빈 문자열을 null로 변환. property, inquiry, schedule, note actions 공유.
- `components/calendar/ScheduleBadge.tsx` — 일정 종류별 색상 배지/점. CATEGORY_LABELS 라벨 맵 export.

### Auth

다중 사용자 PIN 인증. `users` 테이블(name UNIQUE, pin, role admin/member). 로그인 시 이름 선택 → PIN 4자리 입력 → DB 검증 → `auth_user` httpOnly JSON 쿠키(`{id,name,role}`) 설정. `middleware.ts`에서 `auth_user` 쿠키 검사. 사용자 0명이면 /signup으로 자동 리다이렉트. 첫 가입자 자동 admin. admin만 사용자 관리(역할 변경/PIN 재설정/삭제) 가능. `lib/auth.ts`의 `getAuthUser()`로 서버 컴포넌트에서 현재 사용자 읽기. `hooks/useAuth.ts`로 클라이언트 사이드 로그아웃.

### DB Schema

단일 `properties` 테이블에 `type` 컬럼(`villa`/`shop`)으로 구분. 가격은 만원 단위 정수. `property_images` 테이블로 사진 관리 (최대 10장). `property_documents` 테이블로 서류 관리 (property_id FK, ON DELETE CASCADE, doc_type: contract/registry/building/etc). `inquiries` 테이블로 문의 관리. `schedules` 테이블로 거래 일정 관리 (property_id FK, ON DELETE SET NULL, transaction_amount/fee 컬럼으로 거래금액·복비 저장). `notes` 테이블로 메모 관리 (property_id, inquiry_id FK, ON DELETE SET NULL, updated_at 자동 갱신 트리거). `property_status_history` 테이블로 매물 상태 변경 이력 관리 (property_id FK, ON DELETE CASCADE, from_status/to_status/changed_at). `users` 테이블로 사용자 관리 (name UNIQUE, pin, role admin/member). `shared_links` 테이블로 외부 공유 링크 관리 (token UNIQUE, property_ids uuid[], is_active, view_count). RLS 활성화, anon 역할 허용.

### External APIs

- **카카오 주소/지도**: `NEXT_PUBLIC_KAKAO_JS_KEY` 환경변수. SDK는 동적 로딩 (`ensureKakaoMaps()` 싱글턴, `autoload=false` + `kakao.maps.load()`). `AddressSearch.tsx`에서 다음 우편번호 + 카카오맵 연동. `AddressMap.tsx`에서 상세 페이지 읽기 전용 지도 표시.
- **카카오톡 공유**: `layout.tsx`에서 `kakao.min.js` 로드. `ShareButtons.tsx`에서 `Kakao.Share.sendDefault` 호출. 카카오 개발자센터에서 플랫폼 도메인 등록 필수.
- **Supabase Storage**: `property-photos` 버킷 (사진), `property-documents` 버킷 (서류). 둘 다 public, anon 권한. 업로드 시 Buffer 변환 필요.

### 검색/정렬/필터

- 매물: 주소/메모/특이사항 ilike 검색 (`.or("address,memo,notes")`), 보증금순/상태순/최신순 정렬
- 매물 상세 필터: "필터" 버튼 → 하단 슬라이드 패널 (7개 조건)
  - 거래유형(월세/전세/매매), 보증금 구간, 월세 구간, 방 개수, 입주상태(공실/입주중), 연식, 층수(지상/지하)
  - `lib/constants/filterRanges.ts` — 7개 필터 옵션 상수 (구간별 min/max 포함)
  - `components/properties/FilterPanel.tsx` — 하단 슬라이드 패널 (Client Component). 내부 임시 state → "적용" 시 URL 반영.
  - `components/properties/PropertyFilter.tsx` — "필터" 버튼 + 적용 개수 뱃지 ("필터 3")
  - `lib/queries/properties.ts` — `PropertyFilters` 인터페이스에 7개 필터 키, `applyRangeFilter()` 헬퍼로 구간 쿼리
  - 패널 하단: "초기화" (모든 필터 해제) + "적용 (N)" (URL searchParams 업데이트)
- 문의: 이름/연락처 or ilike 검색, 문의일순/최신순 정렬
- URL searchParams로 서버 사이드 처리, `parseEnum()`으로 런타임 검증

### 엑셀 내보내기

- 매물장/문의장 탭 필터 행에 "엑셀" 버튼 배치
- `lib/export/xlsx.ts` — 클라이언트 사이드 xlsx 생성 (`exportPropertiesToXlsx`, `exportInquiriesToXlsx`)
- 현재 적용된 필터/검색 결과를 그대로 내보냄 (서버에서 조회한 데이터를 props로 전달)
- 매물 18개 컬럼, 문의 10개 컬럼 (한글 헤더, 만원 단위 가격, 한글 라벨 변환)
- 파일명: `매물목록_YYYYMMDD.xlsx` / `문의목록_YYYYMMDD.xlsx`
- `components/properties/ExportButton.tsx`, `components/inquiries/ExportButton.tsx` — Client Component
- PropertyFilter/InquiryFilter에 `exportButton` prop (ReactNode)으로 주입

### 탭 구조

- 메인 탭: 매물장 / 문의장 / 캘린더 (3개)
- 더보기 드롭다운: 통계 / 메모장 / 공유 링크 / 사용자 관리(admin만)
- `components/layout/TabNav.tsx` — MAIN_TABS(3개) + 동적 moreTabs 구조. role prop으로 admin일 때 "사용자 관리" 추가. 더보기 클릭 시 드롭다운 표시, 바깥 클릭 시 닫힘.
- 더보기 탭 선택 시 "더보기" 텍스트에 파란색 활성 표시

### 인앱 알림 배너

- 메인 페이지(`app/main/page.tsx`) 탭 네비 아래에 배치, 다가오는 일정이 있을 때만 표시
- `lib/queries/notifications.ts` — `fetchUpcomingEvents()`: 오늘~7일 이내 schedules 조회 (모든 카테고리), 날짜·시간순 정렬, 연결 매물 주소 포함
- `components/notifications/NotificationBanner.tsx` — 서버 컴포넌트. 오늘 일정(빨강 배경 + 좌측 빨강 보더)과 이번 주 일정(흰 배경) 구분 표시. 각 행 클릭 시 `/calendar/{id}/edit`로 이동. 일정 0건이면 배너 숨김.

### 캘린더 (거래 일정)
- `components/calendar/CalendarView.tsx` — 월간 달력 그리드 (Client Component). 월 이동 시 `/api/schedules?year=&month=`로 클라이언트 fetch (전체 새로고침 없음).
- `components/calendar/DaySchedules.tsx` — 선택 날짜 일정 목록, 일정 클릭 시 수정 페이지 이동
- 일정 종류: contract(계약서/파랑), move_in(입주/초록), balance(잔금/빨강), interim(중도금/주황), etc(기타/회색)
- 매물 연결 선택적 (property_id nullable). 독립 일정도 가능.
- 시간: 체크박스 ON 시만 입력 (schedule_time nullable)
- ScheduleForm: 연결 매물 드롭다운은 `/api/properties/active`에서 active/reserved 매물 목록 fetch
- 계약서 일정: 거래유형(매매/전세/월세) 선택 → 금액 입력 → 최대중개보수 자동 산출 + 실제중개보수 입력
- 월세 환산: 보증금 + 월세×100 (5천만 미만 시 ×70)

### 메모장

- 더보기 → 메모장 (tab=notes)
- `notes` 테이블: title(필수), content, property_id/inquiry_id FK (선택적 연결)
- 반응형 레이아웃: PC/태블릿(md 이상) 좌우 2단 (목록+상세), 모바일 1단 피드
- `components/notes/NoteLayout.tsx` — 반응형 분기 (hidden md:grid / md:hidden)
- `components/notes/NoteList.tsx` — 메모 목록 (제목, 날짜, 미리보기, 연결 배지). 2단 모드에서 선택 메모 하이라이트.
- `components/notes/NoteDetail.tsx` — 상세 표시 (제목, 작성일, 수정일, 연결 배지, 내용)
- `components/notes/NoteBadge.tsx` — 연결 매물(파랑)/문의(주황) 배지. 클릭 시 해당 상세 페이지 이동.
- 모바일에서 메모 클릭 시 `/notes/[id]` 상세 페이지 이동
- NoteForm: 연결 매물(`/api/properties/active`), 연결 문의(`/api/inquiries` GET) 드롭다운
- 작성일 자동 기록 (created_at), 수정 시 updated_at 자동 갱신

### 통계 대시보드

- 더보기 → 통계 (tab=statistics)
- `lib/queries/statistics.ts` — 4개 쿼리 함수 (월별 계약 건수, 월별 수익, 다가오는 잔금일, 이번 달 요약)
- 수익 귀속 로직: 계약서의 fee → 같은 property_id의 잔금일 월에 집계 (잔금일 없으면 미집계)
- `components/statistics/` — SummaryCards(서버), ContractChart(클라이언트, recharts), RevenueChart(클라이언트, recharts), UpcomingBalances(서버)
- `lib/utils/brokerageFee.ts` — calculateFee(dealType, amount): 2024 법정 상한요율, getMonthlyRentAmount(): 월세 환산액

### 매물 상세 페이지

- 상태 변경: `StatusChanger` 컴포넌트로 가능/계약중/완료 전환, 변경 시 `property_status_history`에 이력 자동 기록
- 상태 변경 이력: `StatusHistorySection` — 시간순 이력 표시 (from → to, 날짜)
- 관심 가능 문의: `MatchingInquiriesSection` — `fetchMatchingInquiries()`로 매물 조건에 맞는 active 문의 역방향 매칭 (거래유형, 보증금 범위, 월세 상한, 방수)
- 매물 복사: 헤더 "복사" 버튼 → `/properties/new?copyFrom={id}`로 이동, 기존 데이터 프리필 (사진 제외, 상태 "가능"으로 초기화)
- 전화 연결: 집주인 전화번호 `tel:` 링크 버튼 (모바일 원터치 발신)
- 내부 공유: 카카오톡 공유 + 링크 복사
- 고객 공유: 외부 열람 링크 생성 (비공개 필드 제외)
- 첨부 서류: `DocumentSection` — 서류 목록(`DocumentList`) + 업로드(`DocumentUpload`). 종류별 배지(계약서/등기부등본/건축물대장/기타), 다운로드, 삭제. 사진과 별도 Storage 버킷(`property-documents`). 고객 열람 페이지에는 미노출(내부용).

### 고객 열람 페이지 (외부 공유)

- 공유 단위: 매물 1건 또는 여러 매물 묶음
- `shared_links` 테이블: token(랜덤 base64url), property_ids(uuid[]), is_active, view_count
- `/share/[token]` 공개 페이지 — 미들웨어 인증 예외 (`middleware.ts` matcher에 `share` 추가)
- **보안**: 공개 쿼리(`lib/queries/share.ts`)에서 공개 필드만 whitelist select. 비공개 필드(owner_phone, owner_personality, door_password, memo)는 쿼리에서 아예 제외.
- `types/sharedLink.ts` — `PublicProperty` 타입 (비공개 필드 없음)
- `components/share/PublicPropertyView.tsx` — 공개 매물 상세 (주소/가격/정보/사진/지도/특이사항만)
- `components/share/PublicPropertyCard.tsx` — 묶음 공유 시 카드 나열
- `app/share/[token]/SharePageClient.tsx` — 단일/묶음 뷰 전환, 하단 중개사 연락처 고정
- 링크 생성: 매물 상세 "고객 공유 링크 만들기" 버튼 (`CreateShareLinkButton`) + 매물 목록 "선택 공유" 모드 (`PropertyListWithSelect`)
- 생성 후: 링크 표시 + 카카오톡 공유 + 링크 복사
- 관리: 더보기 → 공유 링크 (tab=shared-links). 활성/비활성 토글, 조회수 확인, 삭제
- 비활성 링크 접속 시 "유효하지 않은 링크입니다" 안내 화면
- 조회수: `increment_shared_link_views` DB 함수로 원자적 증가
- API: `/api/shared-links` (POST 생성), `/api/shared-links/[id]` (PATCH 활성 토글, DELETE 삭제)

### Toast 알림

- `components/ui/Toast.tsx` — Context 기반, `useToast()` 훅
- 성공(초록)/실패(빨강), 2초 자동 사라짐, 화면 상단 중앙
- 저장/수정/삭제/상태변경 모든 작업에 적용

### PWA (Progressive Web App)

- `@ducanh2912/next-pwa`로 Service Worker 자동 생성 (`next.config.mjs`에서 `withPWA` 래핑)
- 개발 모드에서 PWA 비활성화 (`disable: process.env.NODE_ENV === "development"`)
- `public/manifest.json` — 앱 이름 "하나부동산 매물장", standalone, portrait, theme_color #0066FF
- `public/icons/` — 192x192, 512x512 PNG (파란 배경 + "하나" 텍스트)
- 아이콘 재생성: `node scripts/generate-icons.mjs` (@napi-rs/canvas devDependency)
- `app/layout.tsx` — metadata에 manifest, appleWebApp, icons.apple, viewport에 themeColor 설정
- **캐싱 전략**:
  - 앱 셸 (JS/CSS): 자동 precache
  - RSC 페이로드 (`/_next/data/*.json`): NetworkFirst, 1일 만료
  - API GET 응답 (`/api/*`): NetworkFirst, 1일 만료
  - Supabase Storage 이미지/서류: **NetworkOnly** (캐싱 제외)
  - Kakao CDN: NetworkOnly
- **오프라인 UX**:
  - `components/ui/OfflineBanner.tsx` — 오프라인 시 화면 최상단 고정 배너 (z-[9998])
  - `components/providers/OfflineFetchGuard.tsx` — `window.fetch` 래핑, 오프라인 시 non-GET 요청 차단 + toast. 모든 폼이 fetch()를 사용하므로 개별 폼 수정 없이 전체 mutation 차단.
  - `components/ui/RegisterButton.tsx` — 메인 하단 등록 버튼 (Client Component), 오프라인 시 회색 비활성 + toast
  - `hooks/useOnlineStatus.ts` — `useSyncExternalStore` 기반, SSR에서는 항상 true
- **middleware.ts**: `sw.js`, `workbox-*.js`, `manifest.json`, `icons/*` 경로 인증 제외
- **빌드 생성 파일**: `public/sw.js`, `public/workbox-*.js` → `.gitignore`에 등록 (Vercel 빌드 시 자동 생성)

### CSP

프로덕션에서 `next.config.mjs`의 `headers()`로 CSP 설정. 카카오/다음 도메인 + `worker-src 'self'` (Service Worker) 허용.

## 핵심 결정사항

- 빌라/상가 단일 테이블 (type 컬럼 구분)
- RLS: anon 전체 허용 (앱 레벨 사용자 인증)
- Storage: property-photos(사진), property-documents(서류) 버킷 (anon INSERT/SELECT/DELETE)
- 현관 비밀번호: 평문 저장
- 매물-문의 FK 없음 (쿼리 매칭: 문의→매물 `fetchMatchingProperties`, 매물→문의 `fetchMatchingInquiries`)
- 매물-서류 FK 있음 (property_documents.property_id → properties.id, ON DELETE CASCADE)
- 매물-상태이력 FK 있음 (property_status_history.property_id → properties.id, ON DELETE CASCADE)
- 매물-일정 FK 있음 (schedules.property_id → properties.id, ON DELETE SET NULL)
- 메모-매물/문의 FK 있음 (notes.property_id → properties.id, notes.inquiry_id → inquiries.id, ON DELETE SET NULL)
- 수정 후 revalidatePath 필수

## 알려진 이슈 및 해결책

- .next 캐시 오염 시: `rm -rf .next && npm run dev`
- npm 캐시 충돌 시: `--cache /tmp/npm-cache` 우회
- Supabase Storage anon 권한: `TO anon` 명시 필요
- 카카오맵 CSP: frame-src에 `*.kakao.com`, `*.daumcdn.net` 추가
- Supabase fetch 캐싱: Next.js가 fetch를 패치하여 Supabase 응답을 캐싱함. `createClient`에 `cache: "no-store"` 필수 (lib/supabase.ts에 적용 완료)
- sharp 설치 실패 (darwin-arm64): `@napi-rs/canvas`로 대체 사용 (아이콘 생성용)
- PWA Service Worker 등록 실패: middleware.ts matcher에서 `sw.js`, `workbox-*.js` 경로 제외 확인

## 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_KAKAO_JS_KEY`

## Conventions

- 서버 컴포넌트 기본, 클라이언트는 `"use client"` 명시
- `react-hook-form` + Zod로 폼 검증
- `cn()` 유틸리티로 조건부 Tailwind 클래스
- 영문 코드/변수명, 한국어 UI 텍스트/주석
- 에러 발생 시 `alert()` 대신 `toast()` 사용
- 5060 UX: 최소 text-base(16px), 버튼 h-[52px], 필수 필드 "필수" 텍스트 표시
- 배포: `git push origin main` → Vercel 자동 배포, 또는 `vercel --prod`
