/*
DROP FUNCTION IF EXISTS get_transaction_distribution(date, date);

CREATE OR REPLACE FUNCTION get_transaction_distribution (start_date date, end_date date) RETURNS TABLE (
day date,
debit numeric,
credit numeric,
balance numeric,
category_name varchar(255)
) AS $$
BEGIN
RETURN QUERY
SELECT
DATE(t.transaction_date) AS day,
c.name AS category_name,
(COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0))::numeric * -1 AS debit,
(COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0))::numeric AS credit,
(COALESCE(SUM(t.amount), 0))::numeric AS balance
FROM
transactions t
JOIN
categories c ON t.category_id = c.id
GROUP BY
transaction_day,
category_name
ORDER BY
transaction_day,
category_name;
END;
$$ LANGUAGE plpgsql;
*/
/*
SELECT
DATE(t.transaction_date) AS day,
c.name AS category_name,
(COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0))::numeric * -1 AS debit,
(COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0))::numeric AS credit,
(COALESCE(SUM(t.amount), 0))::numeric AS balance
FROM
transactions t
JOIN
categories c ON t.category_id = c.id
GROUP BY
DATE(transaction_date),
t.category_id
*/
-- select SUM(amount), date(t.transaction_date), t.category_id from transactions t group by date(t.transaction_date), t.category_id order by t.transaction_date;
create or replace function get_transaction_distribution_by_status (start_date date, end_date date, user_id text) returns table (
	day date,
	status varchar(8),
	debit numeric,
	credit numeric,
	balance numeric
) as $$
BEGIN
RETURN QUERY SELECT
    tr.day,
    tr.status,
    (COALESCE(SUM(CASE WHEN tr.amount < 0 THEN tr.amount ELSE 0 END), 0))::numeric * -1 AS debit,
    (COALESCE(SUM(CASE WHEN tr.amount > 0 THEN tr.amount ELSE 0 END), 0))::numeric AS credit,
    (COALESCE(SUM(tr.amount), 0))::numeric AS balance
FROM (SELECT amount, t.status, DATE(transaction_date) AS day FROM transactions t) tr
GROUP BY tr.day, tr.status ORDER BY tr.day;
end
$$ language plpgsql;
