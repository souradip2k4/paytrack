/* ========================================================================== */
/* FUNCTIONS */
/* ========================================================================== */
/* ========================================================================== */
/* Returns the total amount for each category */
DROP FUNCTION IF EXISTS get_transaction_by_category;

CREATE OR REPLACE FUNCTION get_transaction_by_category (params JSONB) RETURNS TABLE (
	amount NUMERIC(10, 2),
	name VARCHAR(255),
	category_id UUID
) SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
    v_organization_id TEXT;
    v_filters JSONB;
BEGIN
    v_user_id := params->>'user_id';
    v_organization_id := params->>'organization_id';
    v_filters := params->'filters';

    RETURN QUERY
    SELECT SUM(tr.amount), ca.name, ca.id as category_id
    FROM get_filtered_transactions (v_filters) tr
    LEFT JOIN categories ca ON tr.category_id=ca.id
    WHERE tr.user_id = v_user_id
    AND (tr.organization_id = v_organization_id OR tr.organization_id IS NULL)
    GROUP BY ca.id;
END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_by_category (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_by_category (JSONB) TO authenticated;

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_distribution_by_category;

CREATE OR REPLACE FUNCTION get_transaction_distribution_by_category (params JSONB) RETURNS TABLE (
	category_id UUID,
	day DATE,
	credit NUMERIC(10, 2),
	debit NUMERIC(10, 2),
	balance NUMERIC(10, 2),
	name VARCHAR(255)
) SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
    v_organization_id TEXT;
    v_filters JSONB;
BEGIN
    v_user_id := params->>'user_id';
    v_organization_id := params->>'organization_id';
    v_filters := params->'filters';
RETURN QUERY 
WITH daily_transactions AS (
    SELECT
        tr.category_id,
        DATE (tr.transaction_date) AS day,
        COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount < 0), 0) * -1 AS credit,
        COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount > 0), 0) AS debit,
        COALESCE(SUM(tr.amount), 0) AS balance
    FROM get_filtered_transactions (v_filters) tr
    WHERE tr.user_id = v_user_id
    AND (tr.organization_id = v_organization_id OR tr.organization_id IS NULL)
    GROUP BY DATE (tr.transaction_date), tr.category_id
)
SELECT t.category_id, t.day, t.credit, t.debit, t.balance, c.name
FROM daily_transactions t
LEFT JOIN categories c ON c.id = t.category_id
ORDER BY t.day;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_distribution_by_category (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_distribution_by_category (JSONB) TO authenticated;

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_distribution_by_status;

CREATE TYPE transaction_distribution_by_status AS (
	status VARCHAR(8),
	day DATE,
	credit NUMERIC(10, 2),
	debit NUMERIC(10, 2),
	balance NUMERIC(10, 2)
);

CREATE OR REPLACE FUNCTION get_transaction_distribution_by_status (params JSONB) RETURNS SETOF transaction_distribution_by_status SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
    v_organization_id TEXT;
    v_filters JSONB;
BEGIN
    v_user_id := params->>'user_id';
    v_organization_id := params->>'organization_id';
    v_filters := params->'filters';
RETURN QUERY 
SELECT
    tr.status,
    DATE (tr.transaction_date) AS day,
    (COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount < 0), 0) * -1)::NUMERIC(10, 2) AS credit,
    (COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount > 0), 0))::NUMERIC(10, 2) AS debit,
    (COALESCE(SUM(tr.amount), 0))::NUMERIC(10, 2) AS balance
FROM get_filtered_transactions (v_filters) tr
WHERE tr.user_id = v_user_id
AND (tr.organization_id = v_organization_id OR tr.organization_id IS NULL)
GROUP BY DATE (tr.transaction_date), tr.status;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_distribution_by_status (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_distribution_by_status (JSONB) TO authenticated;

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_filtered_transactions;

CREATE OR REPLACE FUNCTION get_filtered_transactions (filters jsonb) RETURNS SETOF transactions AS $$
DECLARE
    query_sql text;
    where_clauses text[] := '{}';
    filter_item jsonb;
    field text;
    operation text;
    value jsonb;
    column_name text;
    value_array text[];
BEGIN
    query_sql := 'SELECT id, amount, currency, user_id, organization_id, external_id, category_id, reference_no, name, description, status, source, metadata, transaction_date, created_at, updated_at FROM transactions';

    IF filters IS NULL OR jsonb_typeof(filters) != 'array' OR jsonb_array_length(filters) = 0 THEN
        RETURN QUERY EXECUTE query_sql;
        RETURN;
    END IF;

    -- Loop through each filter object in the jsonb array
    FOR filter_item IN SELECT * FROM jsonb_array_elements(filters)
    LOOP
        -- Extract field, operation, and value from the filter object
        field       := filter_item->>'field';
        operation   := filter_item->>'operation';
        value       := filter_item->'value';

        -- Map the user-friendly field name to the actual column name for security.
        -- This acts as a whitelist to prevent arbitrary column filtering.
        SELECT
            CASE field
                WHEN 'amount'           THEN 'amount'
                WHEN 'category'       THEN 'category_id'
                WHEN 'status'           THEN 'status'
                WHEN 'created_at'       THEN 'created_at'
                WHEN 'updated_at'       THEN 'updated_at'
                WHEN 'transaction_date' THEN 'transaction_date'
                ELSE NULL -- Ignore any fields not in this list
            END
        INTO column_name;

        -- If the field is not in our whitelist, skip to the next filter
        IF column_name IS NULL THEN
            CONTINUE;
        END IF;

        -- === Amount Filtering (numeric) ===
        IF field = 'amount' THEN
            IF operation IN ('eq', 'gt', 'gte', 'lt', 'lte') AND jsonb_typeof(value) = 'number' THEN
                where_clauses := where_clauses || format('%I %s %L', column_name,
                    CASE operation
                        WHEN 'eq'  THEN '='
                        WHEN 'gt'  THEN '>'
                        WHEN 'gte' THEN '>='
                        WHEN 'lt'  THEN '<'
                        WHEN 'lte' THEN '<='
                    END,
                    value #>> '{}' -- Extracts the numeric value as text for the literal
                );
            END IF;

        -- === Categories Filtering (uuid[]) ===
        ELSIF field = 'category' THEN
            IF operation = 'is empty' THEN
                where_clauses := where_clauses || format('%I IS NULL', column_name);
            ELSIF operation IN ('is', 'is not') AND jsonb_typeof(value) = 'array' AND jsonb_array_length(value) > 0 THEN
                -- Convert the jsonb array of text into a PostgreSQL text array
                SELECT array_agg(elem) INTO value_array FROM jsonb_array_elements_text(value) AS elem;
                IF operation = 'is' THEN
                    where_clauses := where_clauses || format('%I = ANY(%L::uuid[])', column_name, value_array);
                ELSE -- 'is not'
                    where_clauses := where_clauses || format('NOT (%I = ANY(%L::uuid[]))', column_name, value_array);
                END IF;
            END IF;

        -- === Status Filtering (text[]) ===
        ELSIF field = 'status' THEN
            IF operation = 'is empty' THEN
                where_clauses := where_clauses || format('%I IS NULL', column_name);
            ELSIF operation IN ('is', 'is not') AND jsonb_typeof(value) = 'array' AND jsonb_array_length(value) > 0 THEN
                SELECT array_agg(elem) INTO value_array FROM jsonb_array_elements_text(value) AS elem;
                IF operation = 'is' THEN
                    where_clauses := where_clauses || format('%I = ANY(%L)', column_name, value_array);
                ELSE -- 'is not'
                    where_clauses := where_clauses || format('NOT (%I = ANY(%L))', column_name, value_array);
                END IF;
            END IF;

        -- === Date/Timestamp Filtering ===
        ELSIF field IN ('created_at', 'updated_at', 'transaction_date') THEN
             IF operation = 'from' AND jsonb_typeof(value) = 'string' THEN
                where_clauses := where_clauses || format('%I >= %L::timestamp', column_name, value #>> '{}');
             ELSIF operation = 'to' AND jsonb_typeof(value) = 'string' THEN
                where_clauses := where_clauses || format('%I <= %L::timestamp', column_name, value #>> '{}');
             ELSIF operation = 'between' AND jsonb_typeof(value) = 'array' AND jsonb_array_length(value) = 2 THEN
                where_clauses := where_clauses || format('%I BETWEEN %L::timestamp AND %L::timestamp', column_name, value->>0, value->>1);
             END IF;
        END IF;

    END LOOP;

    -- If any WHERE clauses were generated, append them to the main query
    IF array_length(where_clauses, 1) > 0 THEN
        query_sql := query_sql || ' WHERE ' || array_to_string(where_clauses, ' AND ');
    END IF;

    RETURN QUERY EXECUTE query_sql;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION get_filtered_transactions (JSONB)
FROM
	anon,
	authenticated;

REVOKE ALL ON FUNCTION get_filtered_transactions (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_filtered_transactions (JSONB) TO authenticated;

GRANT
EXECUTE ON FUNCTION get_filtered_transactions (JSONB) TO authenticated;

/* ========================================================================== */
/* CATEGORY DELETION FUNCTIONS (with cascading delete on transactions) */
/* ========================================================================== */
/* Function to delete a category with optional cascading delete of transactions */
CREATE OR REPLACE FUNCTION delete_category (
	p_category_id UUID,
	p_cascade_delete BOOLEAN DEFAULT FALSE
) RETURNS VOID SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    v_user_id := uid();

    -- If cascading delete is enabled, delete all transactions in this category
    IF p_cascade_delete THEN
        DELETE FROM transactions
        WHERE category_id = p_category_id
        AND user_id = v_user_id;
    END IF;

    DELETE FROM categories
    WHERE id = p_category_id
    AND user_id = v_user_id;
END;
$$ LANGUAGE plpgsql;

/* Grant execute permission to authenticated users */
REVOKE ALL ON FUNCTION delete_category (UUID, BOOLEAN)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION delete_category (UUID, BOOLEAN) TO authenticated;
