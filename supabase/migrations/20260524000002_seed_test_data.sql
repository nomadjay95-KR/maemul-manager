-- ============================================================
-- Seed: 테스트용 샘플 데이터
-- Description: 개발 중 UI 확인용 더미 데이터 (프로덕션 배포 전 제거)
-- ============================================================

-- 빌라 매물 샘플
INSERT INTO properties (type, address, unit_number, rooms, deal_type, deposit, monthly_rent, occupancy_status, owner_phone, lighting, repair_status, building_age, notes)
VALUES
  ('villa', '서울시 관악구 봉천동 123-4', '201호', 2, 'monthly', 1000, 50, 'vacant', '010-1234-5678', '좋음', '올수리', 15, '역세권 도보 5분'),
  ('villa', '서울시 관악구 신림동 456-7', '301호', 3, 'jeonse', 15000, NULL, 'occupied', '010-2345-6789', '보통', '부분수리', 20, '이사 예정'),
  ('villa', '서울시 동작구 상도동 789-1', '102호', 1, 'monthly', 500, 35, 'vacant', '010-3456-7890', '어두움', '올수리', 8, NULL);

-- 상가 매물 샘플
INSERT INTO properties (type, address, floor, area, deal_type, deposit, monthly_rent, premium, business_restriction, occupancy_status, owner_phone, notes)
VALUES
  ('shop', '서울시 관악구 봉천동 200-1', '1층', 45.50, 'monthly', 3000, 150, 5000, '음식점 불가', 'vacant', '010-4567-8901', '대로변 코너'),
  ('shop', '서울시 동작구 노량진동 100-5', '지하1층', 80.00, 'monthly', 5000, 200, NULL, NULL, 'occupied', '010-5678-9012', '유동인구 많음');

-- 빌라 매물 사진 샘플 (URL은 플레이스홀더)
INSERT INTO property_images (property_id, image_url, sort_order)
SELECT id, 'https://placeholder.com/kitchen.jpg', 0
FROM properties WHERE address LIKE '%봉천동 123-4%' AND type = 'villa';

INSERT INTO property_images (property_id, image_url, sort_order)
SELECT id, 'https://placeholder.com/room1.jpg', 1
FROM properties WHERE address LIKE '%봉천동 123-4%' AND type = 'villa';

-- 문의 샘플 (Phase 2 테스트용)
INSERT INTO inquiries (name, phone, request_details, desired_deal_type, desired_deposit_max, desired_rent_max, desired_rooms, response_result)
VALUES
  ('김영희', '010-9999-1111', '봉천동 근처 방 2개 월세', 'monthly', 1000, 60, 2, '매물 2건 안내'),
  ('박철수', '010-9999-2222', '상도동 전세 1억5천 이하', 'jeonse', 15000, NULL, NULL, '방문 예약');
