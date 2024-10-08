SELECT
    SUM(amount),
    AVG(amount) AS average
FROM
    "Entry"
WHERE
    amount > 0;
