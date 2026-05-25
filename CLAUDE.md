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

- `/lib/actions/` — Server Actions (property, inquiry CRUD)
- `/lib/queries/` — 서버 데이터 조회 함수
- `/lib/validations/` — Zod 스키마
- `/components/forms/` — PropertyForm, InquiryForm, ImageUpload, AddressSearch
- `/types/` — TypeScript 타입 정의
- `/supabase/migrations/` — DB 마이그레이션 SQL

### Auth

PIN 기반 잠금 (사용자 계정 없음). `APP_PIN` 환경변수. `middleware.ts`에서 쿠키(`app_unlocked`) 검사. Supabase anon key로 직접 접근.

### DB Schema

단일 `properties` 테이블에 `type` 컬럼(`villa`/`shop`)으로 구분. 가격은 만원 단위 정수. `property_images` 테이블로 사진 관리. `inquiries` 테이블로 문의 관리. RLS 활성화, anon 역할 허용.

### External APIs

- **카카오 주소/지도**: `NEXT_PUBLIC_KAKAO_JS_KEY` 환경변수. `next/script`로 SDK 로드 (`app/layout.tsx`). `AddressSearch.tsx`에서 다음 우편번호 + 카카오맵 연동.
- **Supabase Storage**: `property-photos` 버킷 (public). 이미지 업로드 시 Buffer 변환 필요.

### CSP

프로덕션에서 `next.config.mjs`의 `headers()`로 CSP 설정. 카카오/다음 도메인 허용 필요.

## 핵심 결정사항

- 빌라/상가 단일 테이블 (type 컬럼 구분)
- RLS: anon 전체 허용 (앱 레벨 PIN 잠금)
- Storage: property-photos 버킷 (anon INSERT/SELECT/DELETE)
- 현관 비밀번호: 평문 저장
- 매물-문의 FK 없음 (쿼리 매칭)
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
- 배포: `git push origin main` → Vercel 자동 배포, 또는 `vercel --prod`
