/*
SELECT 
ds.day,
(COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0))::numeric * -1 AS debit,
(COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0))::numeric AS credit,
(COALESCE(SUM(t.amount), 0))::numeric AS balance,
t.status
FROM (SELECT generate_series('2025-08-01', '2025-08-30', '1 day'::interval)::date AS day) AS ds
LEFT JOIN transactions t ON ds.day = t.transaction_date::date
GROUP BY ds.day, t.status
ORDER BY ds.day
;
*/
DROP FUNCTION IF EXISTS get_transaction_distribution;

CREATE OR REPLACE FUNCTION get_transaction_distribution () RETURNS TABLE (
	category_id uuid,
	day date,
	debit numeric,
	credit numeric,
	balance numeric,
	name varchar(255)
) AS $$
BEGIN

RETURN QUERY SELECT
	t.*,
	c.name
from
	(
		SELECT
			tr.category_id,
			DATE (tr.transaction_date) AS day,
			(
				COALESCE(
					SUM(
						CASE
							WHEN tr.amount < 0 THEN tr.amount
							ELSE 0
						END
					),
					0
				)
			)::numeric * -1 AS debit,
			(
				COALESCE(
					SUM(
						CASE
							WHEN tr.amount > 0 THEN tr.amount
							ELSE 0
						END
					),
					0
				)
			)::numeric AS credit,
			(COALESCE(SUM(tr.amount), 0))::numeric AS balance
		FROM
			transactions tr
		GROUP BY
			DATE (tr.transaction_date),
			tr.category_id
	) t
	left join categories c on c.id = t.category_id
order by
	t.day;

END
$$ LANGUAGE plpgsql;
