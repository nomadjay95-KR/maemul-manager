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
- Vercel 배포 (main push 시 자동 배포)

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

테스트 프레임워크 미설정. 변경 후 반드시 `npm run build`로 검증.

## Architecture

### Data Flow

- **Server Components** → `/lib/queries/`로 데이터 조회
- **Server Actions** (`/lib/actions/`) → 생성/수정/삭제 후 `revalidatePath`
- **API Routes** (`/app/api/`) → FormData 파일 업로드, PIN 인증
- **Supabase** 직접 클라이언트 사용 (ORM 없음), `/lib/supabase.ts` 싱글턴

### Key Directories

- `/lib/actions/` — Server Actions (property, inquiry, schedule, note CRUD)
- `/lib/queries/` — 서버 데이터 조회 함수 (검색/정렬/통계 지원)
- `/lib/validations/` — Zod 스키마
- `/lib/format/` — 가격 포맷, 라벨 매핑 유틸
- `/lib/utils/` — brokerageFee.ts (복비 자동산출 유틸)
- `/lib/constants/` — filterRanges.ts (매물 필터 옵션 상수)
- `/components/forms/` — PropertyForm, InquiryForm, ScheduleForm, NoteForm, ImageUpload, AddressSearch, Field
- `/components/properties/` — PropertyFilter, FilterPanel, PropertyCard, LockButton, StatusButtons
- `/components/calendar/` — CalendarView, DaySchedules, ScheduleBadge, DeleteScheduleButton
- `/components/statistics/` — SummaryCards, ContractChart, RevenueChart, UpcomingBalances
- `/components/notes/` — NoteLayout, NoteList, NoteDetail, NoteBadge, DeleteNoteButton
- `/components/ui/` — shadcn 컴포넌트 + Toast, InfoRow, EmptyState
- `/types/` — TypeScript 타입 정의 (property.ts, schedule.ts, note.ts)
- `/supabase/migrations/` — DB 마이그레이션 SQL

### Shared Components (리팩터링 추출)

- `components/forms/Field.tsx` — 폼 필드 래퍼 (label, error, required 표시). PropertyForm, InquiryForm, ScheduleForm, NoteForm 공유.
- `components/ui/InfoRow.tsx` — 상세 페이지 key-value 행. PropertyDetail, InquiryDetail 공유.
- `components/ui/EmptyState.tsx` — 빈 목록 표시. 메인 페이지 매물/문의/메모 탭 공유.
- `lib/utils.ts` → `cleanData()` — 빈 문자열을 null로 변환. property, inquiry, schedule, note actions 공유.
- `components/calendar/ScheduleBadge.tsx` — 일정 종류별 색상 배지/점. CATEGORY_LABELS 라벨 맵 export.

### Auth

PIN 기반 잠금 (사용자 계정 없음). `APP_PIN` 환경변수. `middleware.ts`에서 쿠키(`app_unlocked`) 검사. Supabase anon key로 직접 접근.

### DB Schema

단일 `properties` 테이블에 `type` 컬럼(`villa`/`shop`)으로 구분. 가격은 만원 단위 정수. `property_images` 테이블로 사진 관리. `inquiries` 테이블로 문의 관리. `schedules` 테이블로 거래 일정 관리 (property_id FK, ON DELETE SET NULL, transaction_amount/fee 컬럼으로 거래금액·복비 저장). `notes` 테이블로 메모 관리 (property_id, inquiry_id FK, ON DELETE SET NULL, updated_at 자동 갱신 트리거). RLS 활성화, anon 역할 허용.

### External APIs

- **카카오 주소/지도**: `NEXT_PUBLIC_KAKAO_JS_KEY` 환경변수. SDK는 동적 로딩 (`ensureKakaoMaps()` 싱글턴, `autoload=false` + `kakao.maps.load()`). `AddressSearch.tsx`에서 다음 우편번호 + 카카오맵 연동. `AddressMap.tsx`에서 상세 페이지 읽기 전용 지도 표시.
- **카카오톡 공유**: `layout.tsx`에서 `kakao.min.js` 로드. `ShareButtons.tsx`에서 `Kakao.Share.sendDefault` 호출. 카카오 개발자센터에서 플랫폼 도메인 등록 필수.
- **Supabase Storage**: `property-photos` 버킷 (public). 이미지 업로드 시 Buffer 변환 필요.

### 검색/정렬/필터

- 매물: 주소 ilike 검색, 보증금순/상태순/최신순 정렬
- 매물 상세 필터: "필터" 버튼 → 하단 슬라이드 패널 (7개 조건)
  - 거래유형(월세/전세/매매), 보증금 구간, 월세 구간, 방 개수, 입주상태(공실/입주중), 연식, 층수(지상/지하)
  - `lib/constants/filterRanges.ts` — 7개 필터 옵션 상수 (구간별 min/max 포함)
  - `components/properties/FilterPanel.tsx` — 하단 슬라이드 패널 (Client Component). 내부 임시 state → "적용" 시 URL 반영.
  - `components/properties/PropertyFilter.tsx` — "필터" 버튼 + 적용 개수 뱃지 ("필터 3")
  - `lib/queries/properties.ts` — `PropertyFilters` 인터페이스에 7개 필터 키, `applyRangeFilter()` 헬퍼로 구간 쿼리
  - 패널 하단: "초기화" (모든 필터 해제) + "적용 (N)" (URL searchParams 업데이트)
- 문의: 이름/연락처 or ilike 검색, 문의일순/최신순 정렬
- URL searchParams로 서버 사이드 처리, `parseEnum()`으로 런타임 검증

### 탭 구조

- 메인 탭: 매물장 / 문의장 / 캘린더 (3개)
- 더보기 드롭다운: 통계 / 메모장
- `components/layout/TabNav.tsx` — MAIN_TABS(3개) + MORE_TABS(2개) 구조. 더보기 클릭 시 드롭다운 표시, 바깥 클릭 시 닫힘.
- 더보기 탭 선택 시 "더보기" 텍스트에 파란색 활성 표시

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

### Toast 알림

- `components/ui/Toast.tsx` — Context 기반, `useToast()` 훅
- 성공(초록)/실패(빨강), 2초 자동 사라짐, 화면 상단 중앙
- 저장/수정/삭제/상태변경 모든 작업에 적용

### CSP

프로덕션에서 `next.config.mjs`의 `headers()`로 CSP 설정. 카카오/다음 도메인 허용 필요.

## 핵심 결정사항

- 빌라/상가 단일 테이블 (type 컬럼 구분)
- RLS: anon 전체 허용 (앱 레벨 PIN 잠금)
- Storage: property-photos 버킷 (anon INSERT/SELECT/DELETE)
- 현관 비밀번호: 평문 저장
- 매물-문의 FK 없음 (쿼리 매칭)
- 매물-일정 FK 있음 (schedules.property_id → properties.id, ON DELETE SET NULL)
- 메모-매물/문의 FK 있음 (notes.property_id → properties.id, notes.inquiry_id → inquiries.id, ON DELETE SET NULL)
- 수정 후 revalidatePath 필수

## 알려진 이슈 및 해결책

- .next 캐시 오염 시: `rm -rf .next && npm run dev`
- npm 캐시 충돌 시: `--cache /tmp/npm-cache` 우회
- Supabase Storage anon 권한: `TO anon` 명시 필요
- 카카오맵 CSP: frame-src에 `*.kakao.com`, `*.daumcdn.net` 추가

## 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APP_PIN`
- `NEXT_PUBLIC_KAKAO_JS_KEY`

## Conventions

- 서버 컴포넌트 기본, 클라이언트는 `"use client"` 명시
- `react-hook-form` + Zod로 폼 검증
- `cn()` 유틸리티로 조건부 Tailwind 클래스
- 영문 코드/변수명, 한국어 UI 텍스트/주석
- 에러 발생 시 `alert()` 대신 `toast()` 사용
- 5060 UX: 최소 text-base(16px), 버튼 h-[52px], 필수 필드 "필수" 텍스트 표시
- 배포: `git push origin main` → Vercel 자동 배포, 또는 `vercel --prod`
