CREATE TABLE CUSTOMERS (
	"customer_id"	NUMBER(10)		NOT NULL,
	"customer_name"	VARCHAR2(20)		NOT NULL,
	"main_phone_number"	VARCHAR2(20)		NOT NULL,
	"sub_phone_number"	VARCHAR2(20)		NULL,
	"date_created"	DATE		NOT NULL,
	"date_edited"	DATE		NULL
);

CREATE TABLE REQUEST (
	"request_id"	NUMBER(10)		NOT NULL,
	"subscription_id"	NUMBER(10)		NOT NULL,
	"date_created"	DATE		NOT NULL,
	"date_edited"	DATE		NULL,
	"type"	VARCHAR2(20)		NOT NULL,
	"status"	VARCHAR2(20)		NOT NULL,
	"comment"	VARCHAR2(100)		NULL
);

CREATE TABLE PRODUCT (
	"serial_number"	VARCHAR2(50)		NOT NULL,
	"model_id"	NUMBER(10)		NOT NULL,
	"status"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE WORKER (
	"worker_id"	NUMBER(10)		NOT NULL,
	"worker_name"	VARCHAR2(20)		NOT NULL,
	"phone_number"	VARCHAR2(20)		NOT NULL,
	"type"	VARCHAR2(20)		NULL
);

CREATE TABLE VISIT (
	"visit_id"	NUMBER(10)		NOT NULL,
	"worker_id"	NUMBER(10)		NOT NULL,
	"preference_id"	NUMBER(10)		NOT NULL,
	"actual_visit_date"	DATE		NULL,
	"date_created"	DATE		NOT NULL,
	"type"	VARCHAR2(20)		NOT NULL,
	"status"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE SUBSCRIPTION (
	"subscription_id"	NUMBER(10)		NOT NULL,
	"customer_id"	NUMBER(10)		NOT NULL,
	"model_id"	NUMBER(10)		NOT NULL,
	"subscription_date"	DATE		NULL,
	"expired_date"	DATE		NULL,
	"date_created"	DATE		NOT NULL
);

CREATE TABLE CUSTOMER_AUTH (
	"customer_id"	NUMBER(10)		NOT NULL,
	"auth_id"	VARCHAR2(20)		NOT NULL,
	"password"	VARCHAR2(20)		NOT NULL,
	"date_edited"	DATE		NULL
);

CREATE TABLE MODEL (
	"model_id"	NUMBER(10)		NOT NULL,
	"model_name"	VARCHAR2(50)		NOT NULL,
	"manufacturer"	VARCHAR2(50)		NOT NULL,
	"category"	VARCHAR2(50)		NOT NULL,
	"release_year"	NUMBER(4)		NOT NULL,
	"yearly_fee"	NUMBER(10,2)		NOT NULL
);

CREATE TABLE MODEL_RATING (
	"subscription_id"	NUMBER(10)		NOT NULL, 
	"rating"	NUMBER(1, 0)		NOT NULL,
	"comment"	VARCHAR2(1000)		NULL,
	"date_created"	DATE		NOT NULL,
	"date_edited"	DATE		NULL
);

CREATE TABLE MODEL_AIRCLEANER_SPEC (
	"model_id"	NUMBER(10)		NOT NULL,
	"filter_type"	VARCHAR2(20)		NOT NULL,
	"pm_sensor"	VARCHAR2(20)		NOT NULL,
	"filter_grade"	VARCHAR2(10)		NOT NULL,
	"coverage_area"	NUMBER(5, 1)		NOT NULL
);

CREATE TABLE MODEL_TV_SPEC (
	"model_id"	NUMBER(10)		NOT NULL,
	"screen_size_inch"	NUMBER(3, 1)		NOT NULL,
	"install_type"	VARCHAR2(20)		NOT NULL,
	"display_type"	VARCHAR2(10)		NOT NULL,
	"resolution"	VARCHAR2(10)		NOT NULL
);

CREATE TABLE MODEL_WASHING_SPEC (
	"model_id"	NUMBER(10)		NOT NULL,
	"washer_type"	VARCHAR2(20)		NOT NULL,
	"capacity_kg"	NUMBER(3, 1)		NOT NULL
);

CREATE TABLE MODEL_DRYER_SPEC (
	"model_id"	NUMBER(10)		NOT NULL,
	"capacity_kg"	NUMBER(3, 1)		NOT NULL,
	"install_type"	VARCHAR2(20)		NOT NULL,
	"dry_method"	VARCHAR2(20)		NOT NULL,
	"vent_type"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE MODEL_COMMON_SPEC (
	"model_id"	NUMBER(10)		NOT NULL,
	"weight"	NUMBER(6,2)		NOT NULL,
	"width"	NUMBER(6 ,1)		NOT NULL,
	"length"	NUMBER(6,1)		NOT NULL,
	"height"	NUMBER(6, 1)		NOT NULL,
	"energy_rating"	VARCHAR2(10)		NOT NULL,
	"color"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE PRODUCT_REPAIR_DETAIL (
	"serial_number"	VARCHAR2(50)		NOT NULL,
	"problem_detail"	VARCHAR2(1000)		NOT NULL,
	"solution_detail"	VARCHAR2(1000)		NOT NULL,
	"date_created"	DATE		NOT NULL
);

CREATE TABLE CUSTOMER_ADDRESS (
	"customer_id"	NUMBER(10)		NOT NULL,
	"street_address"	VARCHAR2(255)		NOT NULL,
	"detailed_address"	VARCHAR2(255)		NOT NULL,
	"postal_code"	VARCHAR2(10)		NOT NULL
);

CREATE TABLE REQUEST_PREFERENCE_DATE (
	"preference_id"	NUMBER(10)		NOT NULL,
	"request_id"	NUMBER(10)		NOT NULL,
	"prefer_date"	DATE		NOT NULL
);

CREATE TABLE SUBSCRIPTION_PRODUCT (
	"subscription_id"	NUMBER(10)		NOT NULL,
	"serial_number"	VARCHAR2(50)		NOT NULL
);

ALTER TABLE CUSTOMERS ADD CONSTRAINT "PK_CUSTOMER" PRIMARY KEY (
	"customer_id"
);

ALTER TABLE REQUEST ADD CONSTRAINT "PK_REQUEST" PRIMARY KEY (
	"request_id"
);

ALTER TABLE PRODUCT ADD CONSTRAINT "PK_PRODUCT" PRIMARY KEY (
	"serial_number"
);

ALTER TABLE WORKER ADD CONSTRAINT "PK_WORKER" PRIMARY KEY (
	"worker_id"
);

ALTER TABLE VISIT ADD CONSTRAINT "PK_VISIT" PRIMARY KEY (
	"visit_id"
);

ALTER TABLE SUBSCRIPTION ADD CONSTRAINT "PK_SUBSCRIPTION" PRIMARY KEY (
	"subscription_id"
);

ALTER TABLE CUSTOMER_AUTH ADD CONSTRAINT "PK_CSTMR_AUTH" PRIMARY KEY (
	"customer_id"
);

ALTER TABLE MODEL ADD CONSTRAINT "PK_MODEL" PRIMARY KEY (
	"model_id"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "PK_MODEL_RATING" PRIMARY KEY (
	"subscription_id"
);

ALTER TABLE MODEL_AIRCLEANER_SPEC ADD CONSTRAINT "PK_MODEL_AIRCLEANER_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE MODEL_TV_SPEC ADD CONSTRAINT "PK_MODEL_TV_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE MODEL_WASHING_SPEC ADD CONSTRAINT "PK_MODEL_WASHING_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE MODEL_DRYER_SPEC ADD CONSTRAINT "PK_MODEL_DRYER_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE MODEL_COMMON_SPEC ADD CONSTRAINT "PK_MODEL_COMMON_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE PRODUCT_REPAIR_DETAIL ADD CONSTRAINT "PK_PRODUCT_REPAIR_DETAIL" PRIMARY KEY (
	"serial_number"
);

ALTER TABLE CUSTOMER_ADDRESS ADD CONSTRAINT "PK_CSTMR_ADDRESS" PRIMARY KEY (
	"customer_id"
);

ALTER TABLE REQUEST_PREFERENCE_DATE ADD CONSTRAINT "PK_REQUEST_PREFERENCE_DATE" PRIMARY KEY (
	"preference_id"
);

ALTER TABLE SUBSCRIPTION_PRODUCT ADD CONSTRAINT "PK_SUBSCRIPTION_PRODUCT" PRIMARY KEY (
	"subscription_id"
);

ALTER TABLE CUSTOMER_AUTH ADD CONSTRAINT "FK_CSTMR_TO_CSTMR_AUTH" FOREIGN KEY (
	"customer_id"
)
REFERENCES CUSTOMERS (
	"customer_id"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "FK_SUB_TO_MDL_RATING" FOREIGN KEY (
	"subscription_id"
)
REFERENCES  SUBSCRIPTION (
	"subscription_id"

ALTER TABLE MODEL_AIRCLEANER_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_AIRCLEANER_SPEC" FOREIGN KEY (
	"model_id"
)
REFERENCES MODEL (
	"model_id"
);

ALTER TABLE MODEL_TV_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_TV_SPEC" FOREIGN KEY (
	"model_id"
)
REFERENCES MODEL (
	"model_id"
);

ALTER TABLE MODEL_WASHING_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_WASHING_SPEC" FOREIGN KEY (
	"model_id"
)
REFERENCES MODEL (
	"model_id"
);

ALTER TABLE MODEL_DRYER_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_DRYER_SPEC" FOREIGN KEY (
	"model_id"
)
REFERENCES MODEL (
	"model_id"
);

ALTER TABLE MODEL_COMMON_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_COMMON_SPEC" FOREIGN KEY (
	"model_id"
)
REFERENCES MODEL (
	"model_id"
);

ALTER TABLE PRODUCT_REPAIR_DETAIL ADD CONSTRAINT "FK_PRD_TO_PRD_REPAIR_DETAIL" FOREIGN KEY (
	"serial_number"
)
REFERENCES PRODUCT (
	"serial_number"
);

ALTER TABLE CUSTOMER_ADDRESS ADD CONSTRAINT "FK_CSTMR_TO_CSTMR_ADDRESS" FOREIGN KEY (
	"customer_id"
)
REFERENCES CUSTOMERS (
	"customer_id"
);

ALTER TABLE SUBSCRIPTION_PRODUCT ADD CONSTRAINT "FK_SUB_TO_SUB_PRODUCT" FOREIGN KEY (
	"subscription_id"
)
REFERENCES SUBSCRIPTION (
	"subscription_id"
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

CREATE SEQUENCE "R_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "RPD_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "V_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "W_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "S_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "C_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "M_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "PRD_SEQ" START WITH 1 INCREMENT BY 1 NOCACHE;


