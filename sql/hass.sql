CREATE TABLE "customer" (
	"customer_id"	NUMBER(10)		NOT NULL,
	"customer_name"	VARCHAR2(20)		NOT NULL,
	"main_phone_number"	VARCHAR(20)		NOT NULL,
	"sub_phone_number"	VARCHAR(20)		NULL,
	"date_created"	DATE		NOT NULL,
	"date_edited"	DATE		NULL
);

CREATE TABLE "request" (
	"request_id"	NUMBER(10)		NOT NULL,
	"subscription_id"	NUMBER(10)		NOT NULL,
	"date_created"	DATE		NOT NULL,
	"date_edited"	DATE		NULL,
	"type"	VARCHAR2(20)		NOT NULL,
	"status"	VARCHAR2(20)		NOT NULL,
	"comment"	VARCHAR2(100)		NULL
);

CREATE TABLE "product" (
	"serial_number"	VARCHAR2(50)		NOT NULL,
	"model_id"	NUMBER(10)		NOT NULL,
	"status"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE "worker" (
	"worker_id"	NUMBER(10)		NOT NULL,
	"worker_name"	VARCHAR2(20)		NOT NULL,
	"phone_number"	VARCHAR2(20)		NOT NULL,
	"type"	VARCHAR2(20)		NULL
);

CREATE TABLE "visit" (
	"visit_id"	NUMBER(10)		NOT NULL,
	"worker_id"	NUMBER(10)		NOT NULL,
	"preference_id"	NUMBER(10)		NOT NULL,
	"actual_visit_date"	DATE		NULL,
	"date_created"	DATE		NOT NULL,
	"type"	VARCHAR2(20)		NOT NULL,
	"status"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE "subscription" (
	"subscription_id"	NUMBER(10)		NOT NULL,
	"customer_id"	NUMBER(10)		NOT NULL,
	"model_id"	NUMBER(10)		NOT NULL,
	"subscription_date"	DATE		NULL,
	"expired_date"	DATE		NULL,
	"date_created"	DATE		NOT NULL
);

CREATE TABLE "customer_auth" (
	"customer_id"	NUMBER(10)		NOT NULL,
	"auth_id"	VARCHAR2(20)		NOT NULL,
	"password"	VARCHAR2(20)		NOT NULL,
	"date_edited"	DATE		NULL
);

CREATE TABLE "model" (
	"model_id"	NUMBER(10)		NOT NULL,
	"model_name"	VARCHAR2(50)		NOT NULL,
	"manufacturer"	VARCHAR2(50)		NOT NULL,
	"category"	VARCHAR2(50)		NOT NULL,
	"release_year"	NUMBER(4)		NOT NULL,
	"yearly_fee"	NUMBER(10,2)		NOT NULL
);

CREATE TABLE "model_rating" (
	"customer_id"	NUMBER(10)		NOT NULL,
	"model_id"	NUMBER(10)		NOT NULL,
	"rating"	NUMBER(1, 0)		NOT NULL,
	"comment"	VARCHAR2(1000)		NULL,
	"date_created"	DATE		NOT NULL,
	"date_edited"	DATE		NULL
);

CREATE TABLE "model_aircleaner_spec" (
	"model_id"	NUMBER(10)		NOT NULL,
	"filter_type"	VARCHAR2(20)		NOT NULL,
	"pm_sensor"	VARCHAR2(20)		NOT NULL,
	"filter_grade"	VARCHAR2(10)		NOT NULL,
	"ccm_grade"	VARCHAR2(2)		NOT NULL,
	"cadr"	NUMBER(5, 1)		NOT NULL
);

CREATE TABLE "model_tv_spec" (
	"model_id"	NUMBER(10)		NOT NULL,
	"screen_size_inch"	NUMBER(3, 1)		NOT NULL,
	"install_type"	VARCHAR2(20)		NOT NULL,
	"display_type"	VARCHAR2(10)		NOT NULL,
	"resolution"	VARCHAR2(10)		NOT NULL
);

CREATE TABLE "model_washing_spec" (
	"model_id"	NUMBER(10)		NOT NULL,
	"washer_type"	VARCHAR2(20)		NOT NULL,
	"capacity_kg"	NUMBER(3, 1)		NOT NULL
);

CREATE TABLE "model_dryer_spec" (
	"model_id"	NUMBER(10)		NOT NULL,
	"capacity_kg"	NUMBER(3, 1)		NOT NULL,
	"install_type"	VARCHAR2(20)		NOT NULL,
	"dry_method"	VARCHAR2(20)		NOT NULL,
	"vent_type"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE "model_common_spec" (
	"model_id"	NUMBER(10)		NOT NULL,
	"weight"	NUMBER(6,2)		NOT NULL,
	"width"	NUMBER(6 ,1)		NOT NULL,
	"length"	NUMBER(6,1)		NOT NULL,
	"height"	NUMBER(6, 1)		NOT NULL,
	"energy_rating"	VARCHAR2(10)		NOT NULL,
	"color"	VARCHAR2(20)		NOT NULL
);

CREATE TABLE "product_repair_detail" (
	"serial_number"	VARCHAR2(50)		NOT NULL,
	"problem_detail"	VARCHAR2(1000)		NOT NULL,
	"solution_detail"	VARCHAR2(1000)		NOT NULL,
	"date_created"	DATE		NOT NULL
);

CREATE TABLE "customer_address" (
	"customer_id"	NUMBER(10)		NOT NULL,
	"street_address"	VARCHAR2(255)		NOT NULL,
	"detailed_address"	VARCHAR2(255)		NOT NULL,
	"postal_code"	VARCHAR2(10)		NOT NULL
);

CREATE TABLE "request_preference_date" (
	"preference_id"	NUMBER(10)		NOT NULL,
	"request_id"	NUMBER(10)		NOT NULL,
	"prefer_date"	DATE		NOT NULL
);

CREATE TABLE "subscription_product" (
	"subscription_id"	NUMBER(10)		NOT NULL,
	"serial_number"	VARCHAR2(50)		NOT NULL
);

ALTER TABLE "customer" ADD CONSTRAINT "PK_CUSTOMER" PRIMARY KEY (
	"customer_id"
);

ALTER TABLE "request" ADD CONSTRAINT "PK_REQUEST" PRIMARY KEY (
	"request_id"
);

ALTER TABLE "product" ADD CONSTRAINT "PK_PRODUCT" PRIMARY KEY (
	"serial_number"
);

ALTER TABLE "worker" ADD CONSTRAINT "PK_WORKER" PRIMARY KEY (
	"worker_id"
);

ALTER TABLE "visit" ADD CONSTRAINT "PK_VISIT" PRIMARY KEY (
	"visit_id"
);

ALTER TABLE "subscription" ADD CONSTRAINT "PK_SUBSCRIPTION" PRIMARY KEY (
	"subscription_id"
);

ALTER TABLE "customer_auth" ADD CONSTRAINT "PK_cstmr_AUTH" PRIMARY KEY (
	"customer_id"
);

ALTER TABLE "model" ADD CONSTRAINT "PK_MODEL" PRIMARY KEY (
	"model_id"
);

ALTER TABLE "model_rating" ADD CONSTRAINT "PK_MODEL_RATING" PRIMARY KEY (
	"customer_id",
	"model_id"
);

ALTER TABLE "model_aircleaner_spec" ADD CONSTRAINT "PK_MODEL_AIRCLEANER_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE "model_tv_spec" ADD CONSTRAINT "PK_MODEL_TV_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE "model_washing_spec" ADD CONSTRAINT "PK_MODEL_WASHING_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE "model_dryer_spec" ADD CONSTRAINT "PK_MODEL_DRYER_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE "model_common_spec" ADD CONSTRAINT "PK_MODEL_COMMON_SPEC" PRIMARY KEY (
	"model_id"
);

ALTER TABLE "product_repair_detail" ADD CONSTRAINT "PK_PRODUCT_REPAIR_DETAIL" PRIMARY KEY (
	"serial_number"
);

ALTER TABLE "customer_address" ADD CONSTRAINT "PK_cstmr_ADDRESS" PRIMARY KEY (
	"customer_id"
);

ALTER TABLE "request_preference_date" ADD CONSTRAINT "PK_REQUEST_PREFERENCE_DATE" PRIMARY KEY (
	"preference_id"
);

ALTER TABLE "subscription_product" ADD CONSTRAINT "PK_SUBSCRIPTION_PRODUCT" PRIMARY KEY (
	"subscription_id"
);

ALTER TABLE "customer_auth" ADD CONSTRAINT "FK_cstmr_TO_cstmr_auth" FOREIGN KEY (
	"customer_id"
)
REFERENCES "customer" (
	"customer_id"
);

ALTER TABLE "model_rating" ADD CONSTRAINT "FK_cstmr_TO_mdl_rating" FOREIGN KEY (
	"customer_id"
)
REFERENCES "customer" (
	"customer_id"
);

ALTER TABLE "model_rating" ADD CONSTRAINT "FK_mdl_TO_mdl_rating" FOREIGN KEY (
	"model_id"
)
REFERENCES "model" (
	"model_id"
);

ALTER TABLE "model_aircleaner_spec" ADD CONSTRAINT "FK_mdl_TO_mdl_aircleaner_spec" FOREIGN KEY (
	"model_id"
)
REFERENCES "model" (
	"model_id"
);

ALTER TABLE "model_tv_spec" ADD CONSTRAINT "FK_mdl_TO_mdl_tv_spec" FOREIGN KEY (
	"model_id"
)
REFERENCES "model" (
	"model_id"
);

ALTER TABLE "model_washing_spec" ADD CONSTRAINT "FK_mdl_TO_mdl_washing_spec" FOREIGN KEY (
	"model_id"
)
REFERENCES "model" (
	"model_id"
);

ALTER TABLE "model_dryer_spec" ADD CONSTRAINT "FK_mdl_TO_mdl_dryer_spec" FOREIGN KEY (
	"model_id"
)
REFERENCES "model" (
	"model_id"
);

ALTER TABLE "model_common_spec" ADD CONSTRAINT "FK_mdl_TO_mdl_common_spec" FOREIGN KEY (
	"model_id"
)
REFERENCES "model" (
	"model_id"
);

ALTER TABLE "product_repair_detail" ADD CONSTRAINT "FK_prd_TO_prd_repair_detail" FOREIGN KEY (
	"serial_number"
)
REFERENCES "product" (
	"serial_number"
);

ALTER TABLE "customer_address" ADD CONSTRAINT "FK_cstmr_TO_cstmr_address" FOREIGN KEY (
	"customer_id"
)
REFERENCES "customer" (
	"customer_id"
);

ALTER TABLE "subscription_product" ADD CONSTRAINT "FK_sub_TO_sub_product" FOREIGN KEY (
	"subscription_id"
)
REFERENCES "subscription" (
	"subscription_id"
);

CREATE SEQUENCE "r_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "rpd_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "v_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "w_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "s_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "c_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "m_seq" START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE "prd_seq" START WITH 1 INCREMENT BY 1 NOCACHE;