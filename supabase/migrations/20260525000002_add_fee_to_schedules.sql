-- schedules 테이블에 거래금액/복비 컬럼 추가
ALTER TABLE schedules
  ADD COLUMN transaction_amount integer,
  ADD COLUMN fee integer;
