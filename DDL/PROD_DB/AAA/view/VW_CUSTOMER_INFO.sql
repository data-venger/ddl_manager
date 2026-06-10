-- DDL for Snowflake View: PROD_DB.AAA.VW_CUSTOMER_INFO
-- Generated Example SQL

CREATE OR REPLACE SECURE VIEW PROD_DB.AAA.VW_CUSTOMER_INFO AS
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    membership_level,
    is_active
FROM PROD_DB.AAA.TBL_CUSTOMER
WHERE is_active = TRUE;
