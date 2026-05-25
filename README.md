# 부동산 매물장 관리 시스템

공인중개사를 위한 모바일 최적화 매물 관리 웹앱. PIN 잠금, 매물 CRUD, 사진 관리, 문의 관리 및 매물-문의 조건 매칭 기능을 제공합니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **DB / Storage**: Supabase (PostgreSQL + Storage)
- **UI**: shadcn/ui + Tailwind CSS
- **폼 관리**: react-hook-form + Zod
- **배포**: Vercel

## 주요 기능

- PIN 기반 잠금 화면
- 매물 등록/수정/삭제 (빌라, 상가)
- 사진 업로드 (최대 3장, Supabase Storage)
- 매물 상태 관리 (가능/계약중/완료)
- 문의 등록/수정/삭제
- 문의-매물 조건 매칭 (거래유형, 보증금, 월세, 방수)

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 실제 값으로 수정

# 3. 개발 서버 실행
npm run dev
```

`http://localhost:3000`에서 접속. 기본 PIN은 `1234`.

## 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public 키 | `eyJhbGci...` |
| `APP_PIN` | 앱 잠금 해제 PIN | `1234` |

## Vercel 배포

### 1. GitHub 저장소 연결

1. [Vercel](https://vercel.com)에 로그인
2. **Add New → Project** 클릭
3. GitHub 저장소를 Import
4. Framework Preset이 **Next.js**로 자동 감지되는지 확인

### 2. 환경변수 설정

Vercel 프로젝트 설정 → **Environment Variables**에 아래 3개를 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APP_PIN`

### 3. 배포

**Deploy** 클릭. 이후 `main` 브랜치에 push할 때마다 자동 배포됩니다.

### Supabase 설정 참고

- Storage에 `property-photos` 버킷 생성 (public 접근 허용)
- DB 테이블은 `supabase/migrations/` 폴더의 SQL 파일 참조
