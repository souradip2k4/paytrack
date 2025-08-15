CREATE OR REPLACE FUNCTION get_random_category (p_user_id text) RETURNS uuid AS $$
DECLARE
    v_category_id uuid;
BEGIN
    -- Select a random category ID associated with the provided user.
    -- ORDER BY RANDOM() is used to shuffle the results, and LIMIT 1
    -- picks a single one from the shuffled set.
    SELECT id
    INTO v_category_id
    FROM categories
    WHERE user_id = p_user_id
    ORDER BY RANDOM()
    LIMIT 1;

    -- Return the selected random category ID.
    RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

BEGIN
INSERT INTO
	categories (name, user_id)
VALUES
	('Utilities', 's350kzENPqoPvpKylkcY41fFqUoKeJvj'),
	('Rent', 's350kzENPqoPvpKylkcY41fFqUoKeJvj'),
	('Transport', 's350kzENPqoPvpKylkcY41fFqUoKeJvj'),
	(
		'Entertainment',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj'
	),
	('Dining Out', 's350kzENPqoPvpKylkcY41fFqUoKeJvj'),
	('Shopping', 's350kzENPqoPvpKylkcY41fFqUoKeJvj'),
	('Health', 's350kzENPqoPvpKylkcY41fFqUoKeJvj'),
	(
		'Personal Care',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj'
	),
	('Salary', 's350kzENPqoPvpKylkcY41fFqUoKeJvj');

INSERT INTO
	transactions (
		amount,
		currency,
		user_id,
		category_id,
		reference_no,
		name,
		description,
		status,
		transaction_date
	)
VALUES
	(
		50000,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-SLR-001',
		'Monthly Salary',
		'Monthly salary deposit.',
		'paid',
		'2025-08-13'
	),
	(
		350,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-DIN-001',
		'Coffee Shop',
		'Morning coffee and a snack.',
		'paid',
		'2025-08-14'
	),
	(
		-1500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-GRO-001',
		'Supermarket Bill',
		'Weekly groceries at City Mart.',
		'paid',
		'2025-08-12'
	),
	(
		12000,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-RNT-001',
		'Rent Payment',
		'Monthly house rent.',
		'paid',
		'2025-08-11'
	),
	(
		-850,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-UTL-001',
		'Electricity Bill',
		'Monthly electricity bill payment.',
		'paid',
		'2025-08-10'
	),
	(
		7500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-ENT-001',
		'Movie Tickets',
		'Tickets for a new movie release.',
		'paid',
		'2025-08-13'
	),
	(
		-400,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-TRN-001',
		'Fuel Refill',
		'Petrol for the car.',
		'paid',
		'2025-08-13'
	),
	(
		2500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-SHP-001',
		'New T-shirt',
		'Purchased clothing from an online store.',
		'paid',
		'2025-08-15'
	),
	(
		-950,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-MED-001',
		'Pharmacy Bill',
		'Purchased medicines.',
		'paid',
		'2025-08-16'
	),
	(
		600,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-PER-001',
		'Haircut',
		'Haircut at a local salon.',
		'paid',
		'2025-08-18'
	),
	(
		1500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-UTL-002',
		'Internet Bill',
		'Monthly internet subscription.',
		'paid',
		'2025-08-21'
	),
	(
		-3500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-DIN-002',
		'Restaurant Lunch',
		'Lunch with friends at a new restaurant.',
		'paid',
		'2025-08-01'
	),
	(
		1200,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-GRO-002',
		'Weekly Vegetables',
		'Purchased fresh vegetables from a local market.',
		'paid',
		'2025-08-12'
	),
	(
		750,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-TRN-002',
		'Metro Card Recharge',
		'Topping up the metro card for daily commute.',
		'paid',
		'2025-08-14'
	),
	(
		500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-ENT-002',
		'Netflix Subscription',
		'Monthly subscription for streaming service.',
		'paid',
		'2025-08-10'
	),
	(
		-4000,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-SHP-002',
		'New Headphones',
		'Purchased headphones from an electronics store.',
		'paid',
		'2025-08-08'
	),
	(
		15000,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-MED-002',
		'Doctor''s Visit',
		'Consultation fee for a general checkup.',
		'paid',
		'2025-08-12'
	),
	(
		700,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-PER-002',
		'Skincare Products',
		'Purchased face wash and moisturizer.',
		'paid',
		'2025-08-11'
	),
	(
		2500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-UTL-003',
		'Water Bill',
		'Quarterly water bill payment.',
		'paid',
		'2025-08-12'
	),
	(
		-800,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-DIN-003',
		'Dinner with Family',
		'Family dinner at a fine dining restaurant.',
		'paid',
		'2025-08-07'
	),
	(
		1800,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-GRO-003',
		'Monthly Ration',
		'Bulk purchases for a month.',
		'paid',
		'2025-08-18'
	),
	(
		1500,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-TRN-003',
		'Uber Ride',
		'Ride from home to office.',
		'paid',
		'2025-08-08'
	),
	(
		-1000,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-ENT-003',
		'Concert Ticket',
		'Ticket for a live music concert.',
		'paid',
		'2025-08-14'
	),
	(
		3000,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-SHP-003',
		'Gift for friend',
		'Purchased a birthday gift.',
		'paid',
		'2025-08-10'
	),
	(
		1200,
		'INR',
		's350kzENPqoPvpKylkcY41fFqUoKeJvj',
		get_random_category ('s350kzENPqoPvpKylkcY41fFqUoKeJvj'),
		'TRN-MED-003',
		'Dental Checkup',
		'Routine dental checkup.',
		'paid',
		'2025-08-01'
	);

COMMIT;
