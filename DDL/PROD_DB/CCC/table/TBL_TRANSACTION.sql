-- DDL for Snowflake Table: PROD_DB.CCC.TBL_TRANSACTION
-- Generated Example SQL

CREATE OR REPLACE TABLE PROD_DB.CCC.TBL_TRANSACTION (
    order_id NUMBER(38,0) NOT NULL AUTOINCREMENT,
    customer_id NUMBER(38,0) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE(),
    status VARCHAR(50) DEFAULT 'PENDING',
    total_amount NUMBER(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    discount_amount NUMBER(12,2) DEFAULT 0.00,
    shipping_address VARCHAR(500),
    created_at TIMESTAMP_TZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_TZ,
    CONSTRAINT pk_orders PRIMARY KEY (order_id)
)
COMMENT = 'Transactions and orders catalog database table';
