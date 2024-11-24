CREATE TABLE CUSTOMER (
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "CUSTOMER_NAME" VARCHAR2(20) NOT NULL,
    "MAIN_PHONE_NUMBER" VARCHAR2(20) NOT NULL,
    "SUB_PHONE_NUMBER" VARCHAR2(20) NULL,
    "DATE_CREATED" DATE NOT NULL,
    "DATE_EDITED" DATE NULL
);

CREATE TABLE REQUEST (
    "REQUEST_ID" NUMBER(10) NOT NULL,
    "SUBSCRIPTION_ID" NUMBER(10) NOT NULL,
    "DATE_CREATED" DATE NOT NULL,
    "DATE_EDITED" DATE NULL,
    "REQUEST_TYPE" VARCHAR2(20) NOT NULL,
    "REQUEST_STATUS" VARCHAR2(20) NOT NULL,
    "ADDITIONAL_COMMENT" VARCHAR2(100) NULL
);

CREATE TABLE PRODUCT (
    "SERIAL_NUMBER" VARCHAR2(50) NOT NULL,
    "MODEL_ID" NUMBER(10) NOT NULL,
    "PRODUCT_STATUS" VARCHAR2(20) NOT NULL
);

CREATE TABLE WORKER (
    "WORKER_ID" NUMBER(10) NOT NULL,
    "WORKER_NAME" VARCHAR2(20) NOT NULL,
    "PHONE_NUMBER" VARCHAR2(20) NOT NULL,
    "WORKER_SPECIALITY" VARCHAR2(20) NULL    
);

CREATE TABLE VISIT (
    "VISIT_ID" NUMBER(10) NOT NULL,
    "REQUEST_ID" NUMBER(10) NOT NULL,
    "WORKER_ID" NUMBER(10) NOT NULL,
    "VISIT_DATE" DATE NULL,
    "DATE_CREATED" DATE NOT NULL,
    "VISIT_TYPE" VARCHAR2(20) NULL
);

CREATE TABLE SUBSCRIPTION (
    "SUBSCRIPTION_ID" NUMBER(10) NOT NULL,
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "SERIAL_NUMBER" VARCHAR2(50) NOT NULL,
    "SUBSCRIPTION_YEAR" NUMBER(1) NOT NULL,
    "DATE_CREATED" DATE NOT NULL,
    "BEGIN_DATE" DATE NULL,
    "EXPIRED_DATE" DATE NULL
);

CREATE TABLE CUSTOMER_AUTH (
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "AUTH_ID" VARCHAR2(20) NOT NULL,
    "PW_HASH" VARCHAR2(60) NOT NULL,
    "DATE_EDITED" DATE NULL
);

CREATE TABLE WORKER_AUTH (
    "AUTH_ID" VARCHAR2(20) NOT NULL,
    "PW_HASH" VARCHAR2(60) NOT NULL
);

CREATE TABLE COMPANY_AUTH (    
    "AUTH_ID" VARCHAR2(20) NOT NULL,
    "PW_HASH" VARCHAR2(60) NOT NULL
);

CREATE TABLE MODEL (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "MODEL_NAME" VARCHAR2(50) NOT NULL,
    "MODEL_TYPE" VARCHAR2(50) NOT NULL,
    "YEARLY_FEE" NUMBER(10,2) NOT NULL,
    "MANUFACTURER" VARCHAR2(50) NOT NULL,
    "COLOR" VARCHAR2(20) NOT NULL,
    "ENERGY_RATING" NUMBER(1) NOT NULL,
    "RELEASE_YEAR" NUMBER(4) NOT NULL
);

CREATE TABLE MODEL_RATING (
    "RATING_ID" NUMBER(10) NOT NULL,
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "MODEL_ID" NUMBER(10) NOT NULL,
    "RATING" NUMBER(1, 0) NOT NULL,
    "ADDITIONAL_COMMENT" VARCHAR2(1000) NULL,
    "DATE_CREATED" DATE NOT NULL,
    "DATE_EDITED" DATE NULL
);

CREATE TABLE MODEL_AIRCLEANER_SPEC (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "FILTER_TYPE" VARCHAR2(20) NOT NULL,
    "PM_SENSOR" VARCHAR2(20) NOT NULL,
    "FILTER_GRADE" VARCHAR2(10) NOT NULL,
    "COVERAGE_AREA" NUMBER(5, 1) NOT NULL
);

CREATE TABLE MODEL_TV_SPEC (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "SCREEN_SIZE_INCH" NUMBER(3, 1) NOT NULL,
    "INSTALL_TYPE" VARCHAR2(20) NOT NULL,
    "DISPLAY_TYPE" VARCHAR2(10) NOT NULL,
    "RESOLUTION" VARCHAR2(10) NOT NULL
);

CREATE TABLE MODEL_WASHING_SPEC (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "WASHING_TYPE" VARCHAR2(20) NOT NULL,
    "CAPACITY_KG" NUMBER(3, 1) NOT NULL
);

CREATE TABLE MODEL_DRYER_SPEC (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "CAPACITY_KG" NUMBER(3, 1) NOT NULL,
    "INSTALL_TYPE" VARCHAR2(20) NOT NULL,
    "DRY_METHOD" VARCHAR2(20) NOT NULL,
    "VENT_TYPE" VARCHAR2(25) NOT NULL
);



CREATE TABLE VISIT_REPAIR (
	"VISIT_ID"	NUMBER(10)		NOT NULL,
	"PROBLEM_DETAIL"	VARCHAR2(1000)		NOT NULL,
	"SOLUTION_DETAIL"	VARCHAR2(1000)		NOT NULL
);

CREATE TABLE CUSTOMER_ADDRESS (
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "STREET_ADDRESS" VARCHAR2(255) NOT NULL,
    "DETAILED_ADDRESS" VARCHAR2(255) NOT NULL,
    "POSTAL_CODE" VARCHAR2(10) NOT NULL
);

CREATE TABLE REQUEST_PREFERENCE_DATE (
    "PREFERENCE_ID" NUMBER(10) NOT NULL,
    "REQUEST_ID" NUMBER(10) NOT NULL,
    "PREFER_DATE" DATE NOT NULL
);


ALTER TABLE CUSTOMER ADD CONSTRAINT "PK_CUSTOMER" PRIMARY KEY (
	"CUSTOMER_ID"
);

ALTER TABLE REQUEST ADD CONSTRAINT "PK_REQUEST" PRIMARY KEY (
	"REQUEST_ID"
);

ALTER TABLE PRODUCT ADD CONSTRAINT "PK_PRODUCT" PRIMARY KEY (
	"SERIAL_NUMBER"
);

ALTER TABLE WORKER ADD CONSTRAINT "PK_WORKER" PRIMARY KEY (
	"WORKER_ID"
);

ALTER TABLE VISIT ADD CONSTRAINT "PK_VISIT" PRIMARY KEY (
	"VISIT_ID"
);

ALTER TABLE SUBSCRIPTION ADD CONSTRAINT "PK_SUBSCRIPTION" PRIMARY KEY (
	"SUBSCRIPTION_ID"
);

ALTER TABLE CUSTOMER_AUTH ADD CONSTRAINT "PK_CSTMR_AUTH" PRIMARY KEY (
	"CUSTOMER_ID"
);

ALTER TABLE WORKER_AUTH ADD CONSTRAINT "PK_WORKER_AUTH" PRIMARY KEY (
	"AUTH_ID"
);

ALTER TABLE COMPANY_AUTH ADD CONSTRAINT "PK_COMPANY_AUTH" PRIMARY KEY (
	"AUTH_ID"
);

ALTER TABLE MODEL ADD CONSTRAINT "PK_MODEL" PRIMARY KEY (
	"MODEL_ID"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "PK_MODEL_RATING" PRIMARY KEY (
	"RATING_ID"
);

ALTER TABLE MODEL_AIRCLEANER_SPEC ADD CONSTRAINT "PK_MODEL_AIRCLEANER_SPEC" PRIMARY KEY (
	"MODEL_ID"
);

ALTER TABLE MODEL_TV_SPEC ADD CONSTRAINT "PK_MODEL_TV_SPEC" PRIMARY KEY (
	"MODEL_ID"
);

ALTER TABLE MODEL_WASHING_SPEC ADD CONSTRAINT "PK_MODEL_WASHING_SPEC" PRIMARY KEY (
	"MODEL_ID"
);

ALTER TABLE MODEL_DRYER_SPEC ADD CONSTRAINT "PK_MODEL_DRYER_SPEC" PRIMARY KEY (
	"MODEL_ID"
);


ALTER TABLE VISIT_REPAIR ADD CONSTRAINT "PK_VISIT_REPAIR" PRIMARY KEY (
	"VISIT_ID"
);

ALTER TABLE REQUEST_PREFERENCE_DATE ADD CONSTRAINT "PK_REQUEST_PREFERENCE_DATE" PRIMARY KEY (
	"PREFERENCE_ID"
);


ALTER TABLE CUSTOMER_AUTH ADD CONSTRAINT "FK_CSTMR_TO_CSTMR_AUTH" FOREIGN KEY (
	"CUSTOMER_ID"
)
REFERENCES CUSTOMER (
	"CUSTOMER_ID"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "FK_CSTMR_TO_MDL_RATING" FOREIGN KEY (
	"CUSTOMER_ID"
)
REFERENCES  CUSTOMER (
	"CUSTOMER_ID"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "FK_MDL_TO_MDL_RATING" FOREIGN KEY (
	"MODEL_ID"
)
REFERENCES MODEL (
	"MODEL_ID"
);

ALTER TABLE MODEL_AIRCLEANER_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_AIRCLEANER_SPEC" FOREIGN KEY (
	"MODEL_ID"
)
REFERENCES MODEL (
	"MODEL_ID"
);

ALTER TABLE MODEL_TV_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_TV_SPEC" FOREIGN KEY (
	"MODEL_ID"
)
REFERENCES MODEL (
	"MODEL_ID"
);

ALTER TABLE MODEL_WASHING_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_WASHING_SPEC" FOREIGN KEY (
	"MODEL_ID"
)
REFERENCES MODEL (
	"MODEL_ID"
);

ALTER TABLE MODEL_DRYER_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_DRYER_SPEC" FOREIGN KEY (
	"MODEL_ID"
)
REFERENCES MODEL (
	"MODEL_ID"
);


ALTER TABLE VISIT_REPAIR ADD CONSTRAINT "FK_VST_TO_VST_REPAIR" FOREIGN KEY (
	"VISIT_ID"
)
REFERENCES VISIT (
	"VISIT_ID"
);

ALTER TABLE CUSTOMER_ADDRESS ADD CONSTRAINT "FK_CSTMR_TO_CSTMR_ADDRESS" FOREIGN KEY (
	"CUSTOMER_ID"
)
REFERENCES CUSTOMER (
	"CUSTOMER_ID"
);

ALTER TABLE REQUEST ADD CONSTRAINT "FK_SUB_TO_REQUEST" FOREIGN KEY (
    "SUBSCRIPTION_ID"
)
REFERENCES SUBSCRIPTION (
    "SUBSCRIPTION_ID"
);

ALTER TABLE PRODUCT ADD CONSTRAINT "FK_MODEL_TO_PRODUCT" FOREIGN KEY (
    "MODEL_ID"
)
REFERENCES MODEL (
    "MODEL_ID"
);

ALTER TABLE VISIT ADD CONSTRAINT "FK_WORKER_TO_VISIT" FOREIGN KEY (
    "WORKER_ID"
)
REFERENCES WORKER (
    "WORKER_ID"
);

ALTER TABLE VISIT ADD CONSTRAINT "FK_REQUEST_TO_VISIT" FOREIGN KEY (
    "REQUEST_ID"
)
REFERENCES REQUEST (
    "REQUEST_ID"
);

ALTER TABLE SUBSCRIPTION ADD CONSTRAINT "FK_CSTMR_TO_SUBSCRIPTION" FOREIGN KEY (
    "CUSTOMER_ID"
)
REFERENCES CUSTOMER (
    "CUSTOMER_ID"
);

ALTER TABLE SUBSCRIPTION ADD CONSTRAINT "FK_PRODUCT_TO_SUBSCRIPTION" FOREIGN KEY (
	"SERIAL_NUMBER"
)
REFERENCES "product" (
	"SERIAL_NUMBER"
);

ALTER TABLE REQUEST_PREFERENCE_DATE ADD CONSTRAINT "FK_RQ_TO_RQ_PREFERENCE_DATE" FOREIGN KEY (
    "REQUEST_ID"
)
REFERENCES REQUEST (
    "REQUEST_ID"
);


-- 시퀀스 제거
DROP SEQUENCE "R_SEQ";
DROP SEQUENCE "RPD_SEQ";
DROP SEQUENCE "V_SEQ";
DROP SEQUENCE "W_SEQ";
DROP SEQUENCE "S_SEQ";
DROP SEQUENCE "C_SEQ";
DROP SEQUENCE "M_SEQ";
DROP SEQUENCE "PRD_SEQ";
DROP SEQUENCE "MR_SEQ";

CREATE SEQUENCE "R_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "RPD_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "V_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "W_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "S_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "C_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "M_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "PRD_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "MR_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
-- 데모데이터 삽입

-- 고객 정보
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(1, '김철수', '010-1234-5678', NULL, TO_TIMESTAMP('2020-10-01 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(2, '이영희', '010-9876-5432', '010-5678-4321', TO_TIMESTAMP('2021-07-15 15:45:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-10 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(3, '박지은', '010-3333-1111', NULL, TO_TIMESTAMP('2021-08-20 14:15:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(4, '오승현', '010-7777-9999', '010-8888-0000', TO_TIMESTAMP('2021-10-05 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-15 13:30:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(5, '김민수', '010-5555-6666', NULL, TO_TIMESTAMP('2022-10-10 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(6, '이지은', '010-4444-3333', '010-2222-1111', TO_TIMESTAMP('2022-09-20 15:30:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);
INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED, DATE_EDITED) VALUES
(7, '김민지', '010-1212-3434', '010-1588-1588', TO_TIMESTAMP('2023-10-01 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);

-- 고객 주소 정보
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(1, '서울특별시 종로구 세종대로 110', '101호', '03174');
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(2, '경기도 성남시 분당구 불정로 6', '305동 1201호', '13557');
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(3, '서울특별시 강남구 테헤란로 521', '강남빌딩 3층', '06164');
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(4, '인천 중구 차이나타운로 76', '101동 201호', '22332');
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(5, '서울특별시 강서구 화곡로 302', '102동 301호', '07777');
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(6, '경기도 수원시 팔달구 권광로 195', '101동 202호', '16488');
INSERT INTO CUSTOMER_ADDRESS (CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES
(7, '경기도 용인시 수지구 죽전로 111', '103동 102호', '16827');

-- 고객 인증 정보
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(1, 'kimcs', '$2b$12$4XZr9kxEIadu3/.YmNBHlukPh3tYNAx3L1PKewR3eM5/QMbxoWpZ6', NULL);
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(2, 'leeyh', '$2b$12$o0wJPijfDUhskGzheedEo.TcmSVT4CKm71cpqb8M7jJsdBGIFuiny', NULL);
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(3, 'Jien', '$2b$12$w.bZDWFAp1qLWskJHZ6G/OuardVRnhAhDY7uUd65fKuO88nmJt4f.', NULL);
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(4, 'ohohoh', '$2b$12$IBXwNJizUcay0m93dL5WsO9EdltETMNAa0k6T9zi3dBoiRvni1h1S', NULL);
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(5, 'kms', '$2b$12$otmWBouAmYFy8f2etVlLJOrgEXjoPfxX9eOpFXXnKxIhpSZU/6c.K', NULL);
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(6, 'leeje', '$2b$12$iDR2YNd4F9ZBwoSJAeMGGuYinoMq3r8GR4UYllYuwnDqOqSJztaTu', NULL);
INSERT INTO CUSTOMER_AUTH (CUSTOMER_ID, AUTH_ID, PW_HASH, DATE_EDITED) VALUES
(7, 'kimmj', '$2b$12$iDR2YNd4F9ZBwoSJAeMGGuYinoMq3r8GR4UYllYuwnDqOqSJztaTu', NULL);



-- 기사 정보
INSERT INTO WORKER (WORKER_ID, WORKER_NAME,WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(1, '박정우', '세탁기', '010-5555-6666');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(2, '최민수', 'TV', '010-4444-3333');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(3, '장미란', '공기청정기', '010-1212-3434');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(4, '강다영', '건조기','010-6767-4545');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(5, '이지은', '세탁기', '010-1234-5878');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(6, '김민지', 'TV', '010-9876-5432');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(7, '박지은', '공기청정기', '010-3333-1111');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(8, '오기훈', '건조기', '010-7777-9999');
INSERT INTO WORKER (WORKER_ID, WORKER_NAME, WORKER_SPECIALITY, PHONE_NUMBER) VALUES
(9, '김철수', '세탁기', '010-6234-5678');

-- 기사 인증 정보
INSERT INTO WORKER_AUTH (AUTH_ID, PW_HASH) VALUES
('best_worker', '$2b$12$5p2Vz2j7o/Ov.m1o9L415O9AIz1IMVMydumsZiyA2KYcwsPdiAsYy');

-- 회사 인증 정보
INSERT INTO COMPANY_AUTH (AUTH_ID, PW_HASH) VALUES
('we_work', '$2b$12$/zqePujr2u9vAYNJJqYlSOVPioAuX8ulMiN0FH/bTB/1uBELYQGhu');

-- 모델 정보
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(1, 'Samsung UltraWash', '세탁기', 50000, 'Samsung', '화이트', 'A++', 2022);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(2, 'LG Smart TV', 'TV', 100000, 'LG', '블랙', 'B', 2021);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(3, 'Samsung AirCleaner', '공기청정기', 200000, 'Samsung', '화이트', 'A', 2023);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(4, 'LG Dryer', '건조기', 150000, 'LG', '실버', 'A+', 2023);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(5, 'Dyson PureCool', '공기청정기', 220000, 'Dyson', '화이트', 'A++', 2023);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(6, 'Samsung SmartDry', '건조기', 180000, 'Samsung', '화이트', 'A', 2022);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(7, 'LG Mini Washer', '세탁기', 80000, 'LG', '화이트', 'A++', 2021);
INSERT INTO MODEL (MODEL_ID, MODEL_NAME, MODEL_TYPE, YEARLY_FEE, MANUFACTURER, COLOR, ENERGY_RATING, RELEASE_YEAR) VALUES
(8, 'LG OLED TV', 'TV', 120000, 'LG', '블랙', 'B', 2022);


-- 모델 세탁기 사양
INSERT INTO MODEL_WASHING_SPEC (MODEL_ID, WASHING_TYPE, CAPACITY_KG) VALUES
(1, '드럼', 10.0);
INSERT INTO MODEL_WASHING_SPEC (MODEL_ID, WASHING_TYPE, CAPACITY_KG) VALUES
(7, '미니', 3.5);

-- 모델 TV 사양
INSERT INTO MODEL_TV_SPEC (MODEL_ID, SCREEN_SIZE_INCH, INSTALL_TYPE, DISPLAY_TYPE, RESOLUTION) VALUES
(2, 55.0, '스탠드형', 'OLED', '4K');
INSERT INTO MODEL_TV_SPEC (MODEL_ID, SCREEN_SIZE_INCH, INSTALL_TYPE, DISPLAY_TYPE, RESOLUTION) VALUES
(8, 55.0, '스탠드형', 'OLED', '4K');

-- 모델 공기청정기 사양
INSERT INTO MODEL_AIRCLEANER_SPEC (MODEL_ID, FILTER_TYPE, PM_SENSOR, FILTER_GRADE, COVERAGE_AREA) VALUES
(3, '판형', 'PM2.5', 'H13', 50.5);
INSERT INTO MODEL_AIRCLEANER_SPEC (MODEL_ID, FILTER_TYPE, PM_SENSOR, FILTER_GRADE, COVERAGE_AREA) VALUES
(5, '원통형', 'PM2.5', 'H13', 50.0);

-- 모델 건조기 사양
INSERT INTO MODEL_DRYER_SPEC (MODEL_ID, CAPACITY_KG, INSTALL_TYPE, DRY_METHOD, VENT_TYPE) VALUES
(4, 8.0, '벽걸이', '히트펌프식', '직접 배기 방식');
INSERT INTO MODEL_DRYER_SPEC (MODEL_ID, CAPACITY_KG, INSTALL_TYPE, DRY_METHOD, VENT_TYPE) VALUES
(6, 9.0, '벽걸이', '히트펌프식', '콘덴싱 배수 방식');

-- 제품 정보
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1234567890', '구독중', 1);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1224566628', '구독대기', 7);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1224566629', '재고', 7);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN0987654321', '구독중', 2);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN0987654322', '재고', 2);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1722678631', '재고', 8);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1722678632', '재고', 8);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1112131415', '재고', 3);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1112131416', '구독중', 3);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1112131417', '재고', 3);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1378055453', '재고', 5);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1378055454', '재고', 5);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1617181920', '재고', 4);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1987338345', '재고', 6);
INSERT INTO PRODUCT (SERIAL_NUMBER, PRODUCT_STATUS, MODEL_ID) VALUES
('SN1987338346', '재고', 6);

-- 구독 정보
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(1, 1, TO_TIMESTAMP('2022-10-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2022-10-20 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-20 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), 1, 1);
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(2, 1, TO_TIMESTAMP('2023-10-15 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-25 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-10-25 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), 2, 2);
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(3, 3, TO_TIMESTAMP('2023-10-15 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-11-16 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2026-11-16 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), 3, 3);
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(4, 1, TO_TIMESTAMP('2023-10-15 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-17 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-10-17 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), 4, 6);
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(5, 2, TO_TIMESTAMP('2023-10-21 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-25 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-10-25 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), 5, 7);
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(6, 4, TO_TIMESTAMP('2024-11-01 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, NULL, 6, 7);
INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, BEGIN_DATE, EXPIRED_DATE, CUSTOMER_ID, MODEL_ID) VALUES
(7, 1, TO_TIMESTAMP('2024-11-10 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-14 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-14 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 7, 7);
-- 구독 제품 정보
INSERT INTO SUBSCRIPTION_PRODUCT (SUBSCRIPTION_ID, SERIAL_NUMBER) VALUES
(1, 'SN1234567890');
INSERT INTO SUBSCRIPTION_PRODUCT (SUBSCRIPTION_ID, SERIAL_NUMBER) VALUES
(2, 'SN0987654321');
INSERT INTO SUBSCRIPTION_PRODUCT (SUBSCRIPTION_ID, SERIAL_NUMBER) VALUES
(3, 'SN1112131416');
INSERT INTO SUBSCRIPTION_PRODUCT (SUBSCRIPTION_ID, SERIAL_NUMBER) VALUES
(4, 'SN1987338345');
INSERT INTO SUBSCRIPTION_PRODUCT (SUBSCRIPTION_ID, SERIAL_NUMBER) VALUES
(5, 'SN1234567890');
INSERT INTO SUBSCRIPTION_PRODUCT (SUBSCRIPTION_ID, SERIAL_NUMBER) VALUES
(7, 'SN1224566628');

-- 요청 정보
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(1, '설치', '방문완료', '고층 건물이에요 부탁드립니다.', TO_TIMESTAMP('2022-10-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 1);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(2, '고장', '방문완료', '설치해주신 세탁기가 갑자기 작동이 안돼요 다이얼이 안돌아가요', TO_TIMESTAMP('2022-11-15 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 1);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(3, '설치', '방문완료', '조심히 설치해주세요', TO_TIMESTAMP('2023-10-15 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 2);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(4, '설치', '방문완료', '천천히 하셔도 돼요.', TO_TIMESTAMP('2023-10-15 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 3);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(5, '설치', '방문완료', '엘레베이터가 없어요', TO_TIMESTAMP('2023-10-15 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 4);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(6, '회수', '방문완료', '회수요청입니다.', TO_TIMESTAMP('2023-10-20 18:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 1);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(7, '설치', '방문완료', NULL, TO_TIMESTAMP('2023-10-21 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 5);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(8, '고장', '방문완료', '건조기 소리가 너무 큼. 바람 나오는 쪽에 문제 있어보임', TO_TIMESTAMP('2023-10-20 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 4);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(9, '회수', '방문완료', NULL, TO_TIMESTAMP('2024-10-17 17:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 4);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(10, '설치', '대기중', NULL, TO_TIMESTAMP('2024-11-01 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 6);
INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED, SUBSCRIPTION_ID) VALUES
(11, '설치', '방문예정', NULL, TO_TIMESTAMP('2024-11-03 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL, 7);

-- 요청 선호 방문 날짜
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(1, 1, TO_TIMESTAMP('2022-10-16 10:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(2, 1, TO_TIMESTAMP('2022-10-20 14:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(3, 2, TO_TIMESTAMP('2022-11-16 11:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(4, 2, TO_TIMESTAMP('2022-11-16 15:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(5, 3, TO_TIMESTAMP('2023-10-25 11:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(6, 3, TO_TIMESTAMP('2023-10-16 11:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(7, 4, TO_TIMESTAMP('2023-11-16 13:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(8, 4, TO_TIMESTAMP('2023-11-16 18:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(9, 5, TO_TIMESTAMP('2023-10-17 11:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(10, 5, TO_TIMESTAMP('2023-10-17 15:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(11, 6, TO_TIMESTAMP('2023-10-21 11:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(12, 6, TO_TIMESTAMP('2023-10-21 15:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(13, 7, TO_TIMESTAMP('2023-10-25 15:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(14, 7, TO_TIMESTAMP('2023-10-27 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(15, 8, TO_TIMESTAMP('2024-10-19 17:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(16, 8, TO_TIMESTAMP('2024-10-20 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(17, 9, TO_TIMESTAMP('2024-10-20 18:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(18, 9, TO_TIMESTAMP('2024-10-30 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(19, 10, TO_TIMESTAMP('2023-11-17 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(20, 10, TO_TIMESTAMP('2023-10-14 09:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(21, 11, TO_TIMESTAMP('2024-11-14 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
(22, 11, TO_TIMESTAMP('2024-11-15 16:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- 방문 정보
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(1, TO_TIMESTAMP('2022-10-20 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2022-10-16 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), 1, 1);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(2, TO_TIMESTAMP('2022-11-16 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2022-11-15 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), 5, 2);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(3, TO_TIMESTAMP('2023-10-25 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-16 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), 2, 3);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(4, TO_TIMESTAMP('2023-11-16 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-15 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), 3, 4);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(5, TO_TIMESTAMP('2023-10-17 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-15 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), 4, 5);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(6, TO_TIMESTAMP('2023-10-21 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-20 18:00:00', 'YYYY-MM-DD HH24:MI:SS'), 9, 6);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(7, TO_TIMESTAMP('2023-10-25 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-21 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), 5, 7);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(8, TO_TIMESTAMP('2023-10-30 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2023-10-20 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 4, 8);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(9, TO_TIMESTAMP('2024-10-20 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-10-17 17:00:00', 'YYYY-MM-DD HH24:MI:SS'), 8, 9);
INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID) VALUES
(10, TO_TIMESTAMP('2024-11-14 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-10 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), 5, 11);

--수리 세부 정보
INSERT INTO VISIT_REPAIR (VISIT_ID, PROBLEM_DETAIL, SOLUTION_DETAIL ) VALUES
(2, '세탁기 다이얼 고장으로 인한 작동 불가', '세탁기 다이얼 교체');
INSERT  INTO VISIT_REPAIR (VISIT_ID, PROBLEM_DETAIL, SOLUTION_DETAIL ) VALUES
(8, '건조기 팬 파손', '팬 교체 및 점검 완료');

-- 모델 평점 정보
INSERT INTO MODEL_RATING (SUBSCRIPTION_ID, RATING, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED) VALUES
(1, 5, '최고의 성능입니다!', TO_TIMESTAMP('2023-10-25 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);
INSERT INTO MODEL_RATING (SUBSCRIPTION_ID, RATING, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED) VALUES
(2, 3, '기능은 좋지만 가격이 비쌉니다.', TO_TIMESTAMP('2023-10-30 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);
INSERT INTO MODEL_RATING (SUBSCRIPTION_ID, RATING, ADDITIONAL_COMMENT, DATE_CREATED, DATE_EDITED) VALUES
(5, 4, '나쁘지 않네요.', TO_TIMESTAMP('2023-10-21 18:00:00', 'YYYY-MM-DD HH24:MI:SS'), NULL);