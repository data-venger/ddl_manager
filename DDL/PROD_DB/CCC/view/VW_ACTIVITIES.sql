-- DDL for Snowflake View: PROD_DB.CCC.VW_ACTIVITIES
-- Generated Example SQL

CREATE OR REPLACE VIEW PROD_DB.CCC.VW_ACTIVITIES AS
SELECT 
    id,
    name,
    category,
    value_amount,
    created_at
FROM PROD_DB.CCC.TBL_INFO
WHERE category IS NOT NULL;
