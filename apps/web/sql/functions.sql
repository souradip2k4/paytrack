DROP FUNCTION IF EXISTS get_transaction_summary (date, date);

CREATE OR REPLACE FUNCTION get_transaction_summary (start_date date, end_date date) RETURNS TABLE (
	day date,
	debit numeric,
	credit numeric,
	balance numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        date_series.day,
        (COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0))::numeric * -1 AS debit,
        (COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0))::numeric AS credit,
        (COALESCE(SUM(t.amount), 0))::numeric AS balance
    FROM
        (SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS day) AS date_series
    LEFT JOIN transactions t ON date_series.day = t.transaction_date::date
    GROUP BY
        date_series.day
    ORDER BY
        date_series.day;
END;
$$ LANGUAGE plpgsql;
