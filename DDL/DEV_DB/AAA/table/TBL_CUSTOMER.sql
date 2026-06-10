-- DDL for Snowflake Table: DEV_DB.AAA.TBL_CUSTOMER
-- Generated Example SQL

CREATE OR REPLACE TABLE DEV_DB.AAA.TBL_CUSTOMER (
    customer_id NUMBER(38,0) NOT NULL AUTOINCREMENT,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    country VARCHAR(100) DEFAULT 'United States',
    membership_level VARCHAR(20) DEFAULT 'BRONZE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_customer PRIMARY KEY (customer_id)
)
COMMENT = 'Customer records registry';
