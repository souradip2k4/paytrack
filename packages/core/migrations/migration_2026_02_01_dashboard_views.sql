/* ========================================================================== */
/* DASHBOARD VIEWS TABLE */
/* ========================================================================== */
CREATE TABLE dashboard_views (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(255) NOT NULL DEFAULT 'My Dashboard',
	user_id TEXT REFERENCES users (id) ON DELETE CASCADE,
	organization_id TEXT REFERENCES organizations (id) ON DELETE CASCADE,
	widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
	is_default BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT current_timestamp,
	updated_at TIMESTAMP DEFAULT current_timestamp
);

/* ========================================================================== */
/* TRIGGER: auto-update updated_at */
/* ========================================================================== */
CREATE TRIGGER set_dashboard_views_updated_at BEFORE
UPDATE ON dashboard_views FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp ();

/* ========================================================================== */
/* FUNCTION: get_transaction_aggregate */
/* Returns a single numeric aggregate (sum/average/count) for a metric */
/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_aggregate;

CREATE OR REPLACE FUNCTION get_transaction_aggregate (
	group_by_metric TEXT,
	time_interval TEXT,
	agg_function TEXT
) RETURNS TABLE (
	period TIMESTAMP,
	metric_value TEXT,
	aggregate_result NUMERIC
) AS $$
DECLARE
    clean_metric TEXT;
    clean_interval TEXT;
    clean_agg TEXT;
    query_str TEXT;
BEGIN
    -- We don't want to allow arbitrary SQL injection
    IF agg_function NOT IN ('sum', 'avg', 'count', 'min', 'max') THEN
        RAISE EXCEPTION 'Invalid aggregate: %. Allowed: sum, avg, count, min, max', agg_function;
    END IF;

    clean_metric := quote_ident(group_by_metric);
    clean_interval := quote_literal(time_interval);
    clean_agg := quote_ident(agg_function);

    -- We cast the metric to TEXT to ensure the return type matches the TABLE definition
    query_str := format(
        'SELECT
            date_trunc(%s, transaction_date) AS period,
            CAST(%s AS TEXT) AS metric_value,
            %s(amount)::NUMERIC AS aggregate_result
         FROM transactions
         GROUP BY 1, 2
         ORDER BY 1 DESC, 2 ASC',
        clean_interval,
        clean_metric,
        clean_agg
    );

    RETURN QUERY EXECUTE query_str;
END;
$$ LANGUAGE plpgsql;
