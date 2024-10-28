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
    "REQUEST_TYPE" VARCHAR2(20) NOT NULL,
    "REQUEST_STATUS" VARCHAR2(20) NOT NULL,
    "ADDITIONAL_COMMENT" VARCHAR2(100) NULL,
    "DATE_CREATED" DATE NOT NULL,
    "DATE_EDITED" DATE NULL,
    "SUBSCRIPTION_ID" NUMBER(10) NOT NULL
);

CREATE TABLE PRODUCT (
    "SERIAL_NUMBER" VARCHAR2(50) NOT NULL,
    "PRODUCT_STATUS" VARCHAR2(20) NOT NULL,
    "MODEL_ID" NUMBER(10) NOT NULL
);

CREATE TABLE WORKER (
    "WORKER_ID" NUMBER(10) NOT NULL,
    "WORKER_NAME" VARCHAR2(20) NOT NULL,
	"WORKER_SPECIALTY" VARCHAR2(20) NULL,
    "PHONE_NUMBER" VARCHAR2(20) NOT NULL    
);

CREATE TABLE VISIT (
    "VISIT_ID" NUMBER(10) NOT NULL,
    "VISIT_TYPE" VARCHAR2(20) NOT NULL,
    "VISIT_STATUS" VARCHAR2(20) NOT NULL,
    "ACTUAL_VISIT_DATE" DATE NULL,
    "DATE_CREATED" DATE NOT NULL,
    "WORKER_ID" NUMBER(10) NOT NULL,
    "PREFERENCE_ID" NUMBER(10) NOT NULL
);

CREATE TABLE SUBSCRIPTION (
    "SUBSCRIPTION_ID" NUMBER(10) NOT NULL,
    "DATE_CREATED" DATE NOT NULL,
    "SUBSCRIPTION_DATE" DATE NULL,
    "EXPIRED_DATE" DATE NULL,
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "MODEL_ID" NUMBER(10) NOT NULL
);

CREATE TABLE CUSTOMER_AUTH (
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "AUTH_ID" VARCHAR2(20) NOT NULL,
    "AUTH_PASSWORD" VARCHAR2(20) NOT NULL,
    "DATE_EDITED" DATE NULL
);

CREATE TABLE MODEL (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "MODEL_NAME" VARCHAR2(50) NOT NULL,
    "MANUFACTURER" VARCHAR2(50) NOT NULL,
    "MODEL_TYPE" VARCHAR2(50) NOT NULL,
    "RELEASE_YEAR" NUMBER(4) NOT NULL,
    "YEARLY_FEE" NUMBER(10,2) NOT NULL
);

CREATE TABLE MODEL_RATING (
    "SUBSCRIPTION_ID" NUMBER(10) NOT NULL,
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
    "WASHER_TYPE" VARCHAR2(20) NOT NULL,
    "CAPACITY_KG" NUMBER(3, 1) NOT NULL
);

CREATE TABLE MODEL_DRYER_SPEC (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "CAPACITY_KG" NUMBER(3, 1) NOT NULL,
    "INSTALL_TYPE" VARCHAR2(20) NOT NULL,
    "DRY_METHOD" VARCHAR2(20) NOT NULL,
    "VENT_TYPE" VARCHAR2(25) NOT NULL
);

CREATE TABLE MODEL_COMMON_SPEC (
    "MODEL_ID" NUMBER(10) NOT NULL,
    "MODEL_WEIGHT" NUMBER(6,2) NOT NULL,
    "MODEL_WIDTH" NUMBER(6 ,1) NOT NULL,
    "MODEL_LENGTH" NUMBER(6,1) NOT NULL,
    "MODEL_HEIGHT" NUMBER(6, 1) NOT NULL,
    "ENERGY_RATING" VARCHAR2(10) NOT NULL,
    "COLOR" VARCHAR2(20) NOT NULL
);

CREATE TABLE PRODUCT_REPAIR_DETAIL (
    "SERIAL_NUMBER" VARCHAR2(50) NOT NULL,
    "PROBLEM_DETAIL" VARCHAR2(1000) NOT NULL,
    "SOLUTION_DETAIL" VARCHAR2(1000) NOT NULL,
    "DATE_CREATED" DATE NOT NULL
);

CREATE TABLE CUSTOMER_ADDRESS (
    "CUSTOMER_ID" NUMBER(10) NOT NULL,
    "STREET_ADDRESS" VARCHAR2(255) NOT NULL,
    "DETAILED_ADDRESS" VARCHAR2(255) NOT NULL,
    "POSTAL_CODE" VARCHAR2(10) NOT NULL
);

CREATE TABLE REQUEST_PREFERENCE_DATE (
    "PREFERENCE_ID" NUMBER(10) NOT NULL,
    "PREFER_DATE" DATE NOT NULL,
    "REQUEST_ID" NUMBER(10) NOT NULL
);

CREATE TABLE SUBSCRIPTION_PRODUCT (
    "SUBSCRIPTION_ID" NUMBER(10) NOT NULL,
    "SERIAL_NUMBER" VARCHAR2(50) NOT NULL
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

ALTER TABLE MODEL ADD CONSTRAINT "PK_MODEL" PRIMARY KEY (
	"MODEL_ID"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "PK_MODEL_RATING" PRIMARY KEY (
	"SUBSCRIPTION_ID"
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

ALTER TABLE MODEL_COMMON_SPEC ADD CONSTRAINT "PK_MODEL_COMMON_SPEC" PRIMARY KEY (
	"MODEL_ID"
);

ALTER TABLE PRODUCT_REPAIR_DETAIL ADD CONSTRAINT "PK_PRODUCT_REPAIR_DETAIL" PRIMARY KEY (
	"SERIAL_NUMBER"
);

ALTER TABLE CUSTOMER_ADDRESS ADD CONSTRAINT "PK_CSTMR_ADDRESS" PRIMARY KEY (
	"CUSTOMER_ID"
);

ALTER TABLE REQUEST_PREFERENCE_DATE ADD CONSTRAINT "PK_REQUEST_PREFERENCE_DATE" PRIMARY KEY (
	"PREFERENCE_ID"
);

ALTER TABLE SUBSCRIPTION_PRODUCT ADD CONSTRAINT "PK_SUBSCRIPTION_PRODUCT" PRIMARY KEY (
	"SUBSCRIPTION_ID"
);

ALTER TABLE CUSTOMER_AUTH ADD CONSTRAINT "FK_CSTMR_TO_CSTMR_AUTH" FOREIGN KEY (
	"CUSTOMER_ID"
)
REFERENCES CUSTOMER (
	"CUSTOMER_ID"
);

ALTER TABLE MODEL_RATING ADD CONSTRAINT "FK_SUB_TO_MDL_RATING" FOREIGN KEY (
	"SUBSCRIPTION_ID"
)
REFERENCES  SUBSCRIPTION (
	"SUBSCRIPTION_ID"
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

ALTER TABLE MODEL_COMMON_SPEC ADD CONSTRAINT "FK_MDL_TO_MDL_COMMON_SPEC" FOREIGN KEY (
	"MODEL_ID"
)
REFERENCES MODEL (
	"MODEL_ID"
);

ALTER TABLE PRODUCT_REPAIR_DETAIL ADD CONSTRAINT "FK_PRD_TO_PRD_REPAIR_DETAIL" FOREIGN KEY (
	"SERIAL_NUMBER"
)
REFERENCES PRODUCT (
	"SERIAL_NUMBER"
);

ALTER TABLE CUSTOMER_ADDRESS ADD CONSTRAINT "FK_CSTMR_TO_CSTMR_ADDRESS" FOREIGN KEY (
	"CUSTOMER_ID"
)
REFERENCES CUSTOMER (
	"CUSTOMER_ID"
);

ALTER TABLE SUBSCRIPTION_PRODUCT ADD CONSTRAINT "FK_SUB_TO_SUB_PRODUCT" FOREIGN KEY (
	"SUBSCRIPTION_ID"
)
REFERENCES SUBSCRIPTION (
	"SUBSCRIPTION_ID"
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