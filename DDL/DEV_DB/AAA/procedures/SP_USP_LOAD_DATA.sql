-- DDL for Snowflake Stored Procedure: DEV_DB.AAA.SP_USP_LOAD_DATA
-- Generated Example SQL

CREATE OR REPLACE PROCEDURE DEV_DB.AAA.SP_USP_LOAD_DATA(
    STAGE_NAME VARCHAR,
    TARGET_TABLE VARCHAR
)
RETURNS VARCHAR
LANGUAGE SQL
EXECUTE AS CALLER
AS
DECLARE
    rows_loaded INTEGER;
    log_msg VARCHAR;
BEGIN
    -- Log loading starting execution
    INSERT INTO DEV_DB.AAA.TBL_INFO (name, category, description, value_amount)
    VALUES (:TARGET_TABLE, 'LOG', 'Data load pipeline started', 0);
    
    -- Copy command execution
    EXECUTE IMMEDIATE 'COPY INTO ' || :TARGET_TABLE || 
                      ' FROM @' || :STAGE_NAME || 
                      ' FILE_FORMAT = (TYPE = CSV, SKIP_HEADER = 1)';
                      
    rows_loaded := SQLROWCOUNT;
    log_msg := 'Successfully loaded ' || CAST(rows_loaded AS VARCHAR) || ' rows.';
    
    RETURN :log_msg;
END;
