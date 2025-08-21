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
	('Utilities', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
	('Rent', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
	('Transport', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
	(
		'Entertainment',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'
	),
	('Dining Out', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
	('Shopping', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
	('Health', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
	(
		'Personal Care',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'
	),
	('Salary', 'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw');

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
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-SLR-001',
		'Monthly Salary',
		'Monthly salary deposit.',
		'paid',
		'2025-08-13'
	),
	(
		350,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-DIN-001',
		'Coffee Shop',
		'Morning coffee and a snack.',
		'paid',
		'2025-08-14'
	),
	(
		-1500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-GRO-001',
		'Supermarket Bill',
		'Weekly groceries at City Mart.',
		'paid',
		'2025-08-12'
	),
	(
		12000,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-RNT-001',
		'Rent Payment',
		'Monthly house rent.',
		'paid',
		'2025-08-11'
	),
	(
		-850,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-UTL-001',
		'Electricity Bill',
		'Monthly electricity bill payment.',
		'paid',
		'2025-08-10'
	),
	(
		7500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-ENT-001',
		'Movie Tickets',
		'Tickets for a new movie release.',
		'paid',
		'2025-08-13'
	),
	(
		-400,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-TRN-001',
		'Fuel Refill',
		'Petrol for the car.',
		'paid',
		'2025-08-13'
	),
	(
		2500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-SHP-001',
		'New T-shirt',
		'Purchased clothing from an online store.',
		'paid',
		'2025-08-15'
	),
	(
		-950,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-MED-001',
		'Pharmacy Bill',
		'Purchased medicines.',
		'paid',
		'2025-08-16'
	),
	(
		600,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-PER-001',
		'Haircut',
		'Haircut at a local salon.',
		'paid',
		'2025-08-18'
	),
	(
		1500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-UTL-002',
		'Internet Bill',
		'Monthly internet subscription.',
		'paid',
		'2025-08-21'
	),
	(
		-3500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-DIN-002',
		'Restaurant Lunch',
		'Lunch with friends at a new restaurant.',
		'paid',
		'2025-08-01'
	),
	(
		1200,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-GRO-002',
		'Weekly Vegetables',
		'Purchased fresh vegetables from a local market.',
		'paid',
		'2025-08-12'
	),
	(
		750,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-TRN-002',
		'Metro Card Recharge',
		'Topping up the metro card for daily commute.',
		'paid',
		'2025-08-14'
	),
	(
		500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-ENT-002',
		'Netflix Subscription',
		'Monthly subscription for streaming service.',
		'paid',
		'2025-08-10'
	),
	(
		-4000,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-SHP-002',
		'New Headphones',
		'Purchased headphones from an electronics store.',
		'paid',
		'2025-08-08'
	),
	(
		15000,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-MED-002',
		'Doctor''s Visit',
		'Consultation fee for a general checkup.',
		'paid',
		'2025-08-12'
	),
	(
		700,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-PER-002',
		'Skincare Products',
		'Purchased face wash and moisturizer.',
		'paid',
		'2025-08-11'
	),
	(
		2500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-UTL-003',
		'Water Bill',
		'Quarterly water bill payment.',
		'paid',
		'2025-08-12'
	),
	(
		-800,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-DIN-003',
		'Dinner with Family',
		'Family dinner at a fine dining restaurant.',
		'paid',
		'2025-08-07'
	),
	(
		1800,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-GRO-003',
		'Monthly Ration',
		'Bulk purchases for a month.',
		'paid',
		'2025-08-18'
	),
	(
		1500,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-TRN-003',
		'Uber Ride',
		'Ride from home to office.',
		'paid',
		'2025-08-08'
	),
	(
		-1000,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-ENT-003',
		'Concert Ticket',
		'Ticket for a live music concert.',
		'paid',
		'2025-08-14'
	),
	(
		3000,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-SHP-003',
		'Gift for friend',
		'Purchased a birthday gift.',
		'paid',
		'2025-08-10'
	),
	(
		1200,
		'INR',
		'ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw',
		get_random_category ('ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw'),
		'TRN-MED-003',
		'Dental Checkup',
		'Routine dental checkup.',
		'paid',
		'2025-08-01'
	);

COMMIT;
