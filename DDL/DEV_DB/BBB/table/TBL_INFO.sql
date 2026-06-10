-- DDL for Snowflake Table: DEV_DB.BBB.TBL_INFO
-- Generated Example SQL

CREATE OR REPLACE TABLE DEV_DB.BBB.TBL_INFO (
    id NUMBER(38,0) NOT NULL AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    value_amount NUMBER(18,4),
    description VARCHAR(1000),
    created_by VARCHAR(100) DEFAULT CURRENT_USER(),
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_tbl_info PRIMARY KEY (id)
)
COMMENT = 'General purpose system table for TBL_INFO';
