# DB 스키마 설계 큐시트

---

## 1. 테이블 목록

| 테이블명 | 설명 |
|----------|------|
| `properties` | 매물 정보 (빌라/상가 통합, type 컬럼으로 구분) |
| `property_images` | 매물별 사진 URL 관리 |
| `inquiries` | 고객/타 부동산 문의 이력 (Phase 2, 스키마만 선설계) |

---

## 2. 각 테이블 주요 컬럼

### 2.1 `properties`

| 컬럼명 | 타입 | 제약조건 | 비고 |
|--------|------|----------|------|
| id | uuid | PK, default gen_random_uuid() | |
| type | text | NOT NULL, CHECK(type IN ('villa', 'shop')) | 빌라/상가 구분 |
| address | text | NOT NULL | 주소 |
| unit_number | text | | 호수 (빌라) |
| rooms | integer | | 방 개수 (빌라) |
| deal_type | text | NOT NULL, CHECK(deal_type IN ('monthly', 'jeonse', 'sale')) | 월세/전세/매매 |
| deposit | integer | | 보증금 (만원) |
| monthly_rent | integer | | 월세 (만원) |
| jeonse_price | integer | | 전세금 (만원) |
| sale_price | integer | | 매매가 (만원) |
| loan_available | boolean | | 대출 가능 여부 (전세) |
| floor | text | | 층수 (상가) |
| area | numeric(10,2) | | 면적 m² (상가) |
| premium | integer | | 권리금 만원 (상가) |
| business_restriction | text | | 업종 제한 (상가) |
| occupancy_status | text | NOT NULL, DEFAULT 'vacant', CHECK(... IN ('vacant', 'occupied')) | 공실/거주중(사용중) |
| move_out_month | text | | 이사 예정월 (예: '2026-08') |
| owner_phone | text | | 집주인/임대인 연락처 |
| owner_personality | text | | 임대인 성향 |
| door_password | text | | 집 비밀번호 |
| lighting | text | | 채광 (빌라) |
| repair_status | text | | 수리 상태 (빌라) |
| building_age | integer | | 연식 (빌라) |
| notes | text | | 특이사항 |
| memo | text | | 자유 메모 |
| status | text | NOT NULL, DEFAULT 'active', CHECK(... IN ('active', 'completed')) | 활성/계약완료 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

**인덱스:**
- `idx_properties_type` → type (탭 분리 쿼리)
- `idx_properties_status` → status (활성/보관함 분리)
- `idx_properties_deal_type` → deal_type (필터)
- `idx_properties_deposit` → deposit (가격 범위 필터)
- `idx_properties_rooms` → rooms (방 개수 필터)
- 복합: `idx_properties_type_status` → (type, status)

---

### 2.2 `property_images`

| 컬럼명 | 타입 | 제약조건 | 비고 |
|--------|------|----------|------|
| id | uuid | PK, default gen_random_uuid() | |
| property_id | uuid | NOT NULL, FK → properties(id) ON DELETE CASCADE | |
| image_url | text | NOT NULL | Supabase Storage URL |
| sort_order | integer | NOT NULL, DEFAULT 0 | 표시 순서 (정렬용) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

**인덱스:**
- `idx_property_images_property_id` → property_id

---

### 2.3 `inquiries` (Phase 2 선설계)

| 컬럼명 | 타입 | 제약조건 | 비고 |
|--------|------|----------|------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | 문의자 이름 |
| phone | text | NOT NULL | 연락처 |
| request_details | text | | 문의 사항 (원하는 조건) |
| desired_deal_type | text | | 희망 거래유형 |
| desired_deposit_min | integer | | 희망 보증금 하한 |
| desired_deposit_max | integer | | 희망 보증금 상한 |
| desired_rent_max | integer | | 희망 월세 상한 |
| desired_rooms | integer | | 희망 방 개수 |
| inquiry_date | date | NOT NULL, DEFAULT CURRENT_DATE | |
| response_result | text | | 응대 결과 |
| status | text | NOT NULL, DEFAULT 'active', CHECK(... IN ('active', 'resolved')) | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## 3. 테이블 간 관계도 (텍스트 ERD)

```
┌──────────────┐        ┌───────────────────┐
│  properties  │───1:N──│  property_images  │
│              │        │                   │
│  id (PK)     │◄───────│  property_id (FK) │
│  type        │        │  image_url        │
│  address     │        │  sort_order       │
│  ...         │        └───────────────────┘
└──────────────┘
       │
       │ (Phase 2: 매칭은 쿼리 기반, FK 없음)
       │
┌──────────────┐
│  inquiries   │
│              │
│  id (PK)     │
│  name        │
│  desired_*   │
│  ...         │
└──────────────┘
```

**관계 설명:**
- `properties` 1:N `property_images` — 매물당 최대 10장
- `properties` ↔ `inquiries` — 직접 FK 없음, 조건 매칭은 쿼리 시점에 계산 (거래유형 + 가격범위 + 방개수 비교)

---

## 4. RLS(Row Level Security) 정책 방향

이 앱은 **2명만 사용하는 내부 도구**이므로 RLS는 최소한으로 설정:

| 정책 | 방향 |
|------|------|
| 인증 방식 | Supabase anon key + 앱 레벨 비밀번호 잠금 |
| SELECT | anon 허용 (앱 비밀번호 통과 후에만 접근하므로) |
| INSERT/UPDATE/DELETE | anon 허용 |
| Storage | 공개 읽기, anon 쓰기 허용 (버킷 단위 정책) |

**대안 검토:**
- Supabase Auth를 사용하면 더 안전하지만, 사용자가 2명이고 간단한 비밀번호만 원하므로 오버엔지니어링
- 대신 **Supabase anon key는 절대 클라이언트에 노출되는 것**이므로, service_role key는 서버사이드에서만 사용
- 실질적 보안은 앱 레벨 비밀번호 + HTTPS로 확보

---

## 5. 예상 이슈 및 설계 결정 사항

### 결정 1: 빌라/상가 통합 테이블 vs 분리 테이블

**결정: 통합 (단일 `properties` 테이블 + `type` 컬럼)**

- 장점: 쿼리/필터 로직 단순화, 코드 중복 최소화, 보관함도 하나의 쿼리로 처리
- 단점: 빌라 전용 컬럼(rooms, lighting 등)이 상가에선 NULL, 그 반대도 마찬가지
- 판단: 매물 수가 수백 건 규모이므로 NULL 컬럼의 스토리지 오버헤드 무시 가능. 유지보수 단순성이 더 중요.

### 결정 2: 가격 컬럼 타입 — integer vs numeric

**결정: integer (만원 단위)**

- 부동산 가격은 항상 만원 단위로 표기. 소수점 불필요.
- 예: 보증금 1000만원 → deposit = 1000

### 결정 3: 사진 저장 방식

**결정: Supabase Storage + `property_images` 테이블에 URL 저장**

- Storage 버킷: `property-photos`
- 파일 경로: `{property_id}/{uuid}.webp`
- 클라이언트에서 업로드 전 리사이즈/압축 후 전송
- 매물 삭제(CASCADE) 시 DB 레코드는 자동 삭제, Storage 파일은 별도 cleanup 필요 (트리거 또는 Edge Function)

### 결정 4: 민감 정보(door_password) 저장

**결정: 평문 저장 (앱 레벨에서 마스킹 처리)**

- 실제 현관 비밀번호를 조회할 수 있어야 하므로 단방향 해시 불가
- 암호화(AES 등)를 적용하면 복호화 키 관리 이슈 발생
- 앱 자체가 비밀번호 잠금 뒤에 있고, 사용자 2명만 접근하므로 실용적 판단
- HTTPS로 전송 구간 보호

### 결정 5: updated_at 자동 갱신

**결정: PostgreSQL 트리거로 자동 갱신**

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 승인 요청

위 설계안이 확정되면 실제 SQL migration 파일을 `supabase/migrations/` 디렉토리에 작성하겠습니다.
