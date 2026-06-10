-- DDL for Snowflake View: DEV_DB.AAA.VW_CUSTOMER_INFO
-- Generated Example SQL

CREATE OR REPLACE SECURE VIEW DEV_DB.AAA.VW_CUSTOMER_INFO AS
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    membership_level,
    is_active
FROM DEV_DB.AAA.TBL_CUSTOMER
WHERE is_active = TRUE;
