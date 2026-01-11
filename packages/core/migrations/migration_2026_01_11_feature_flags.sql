CREATE TYPE feature_flag_scope AS ENUM('global', 'account', 'organization');

CREATE TABLE feature_flags (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	key TEXT NOT NULL,
	value BOOLEAN DEFAULT FALSE,
	scope feature_flag_scope NOT NULL,
	scope_id TEXT,
	description TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	UNIQUE (key, scope, scope_id)
);

CREATE INDEX idx_feature_flags_key_scope_scope_id ON feature_flags (key, scope, scope_id);

GRANT
SELECT
	ON feature_flags TO auth_admin;
