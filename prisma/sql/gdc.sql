EXPLAIN ANALYZE
SELECT
    name,
    category_id,
    SUM(amount) AS total,
    SUM(CASE WHEN amount>0 THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN amount<0 THEN -amount ELSE 0 END) AS expense
FROM "Entry"
INNER JOIN "Category" ON "Entry".category_id="Category".id

-- @param {String} $1:user_id
-- @param {DateTime} $2:from
-- @param {DateTime} $3:to
WHERE "Entry".user_id='user_2k3hnpKvotxmMk7LbNBSLV8I4JZ'

GROUP BY category_id, name
ORDER BY name;
