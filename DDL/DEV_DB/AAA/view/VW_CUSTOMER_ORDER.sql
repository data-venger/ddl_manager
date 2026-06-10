-- DDL for Snowflake View: DEV_DB.AAA.VW_CUSTOMER_ORDER
-- Generated Example SQL

CREATE OR REPLACE VIEW DEV_DB.AAA.VW_CUSTOMER_ORDER AS
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
FROM DEV_DB.AAA.TBL_ORDERS o
INNER JOIN DEV_DB.AAA.TBL_CUSTOMER c 
    ON o.customer_id = c.customer_id;
