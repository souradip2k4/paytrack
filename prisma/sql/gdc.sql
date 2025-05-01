SELECT
    date,
    SUM(amount) AS total,
    SUM(CASE WHEN amount>0 THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN amount<0 THEN -amount ELSE 0 END) AS expense
FROM "Entry"

-- @param {String} $1:user_id
-- @param {DateTime} $2:from
-- @param {DateTime} $3:to
WHERE user_id='user_2k3hnpKvotxmMk7LbNBSLV8I4JZ' AND date >= '2024-01-01' AND date <= '2026-01-01'
GROUP BY date
ORDER BY date;
