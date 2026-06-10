-- DDL for Snowflake View: PROD_DB.BBB.VW_ORDERS
-- Generated Example SQL

CREATE OR REPLACE VIEW PROD_DB.BBB.VW_ORDERS AS
SELECT 
    o.order_id,
    o.order_date,
    o.status,
    o.total_amount,
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.membership_level
FROM PROD_DB.BBB.TBL_ORDERS o
INNER JOIN PROD_DB.BBB.TBL_CUSTOMER c 
    ON o.customer_id = c.customer_id;
