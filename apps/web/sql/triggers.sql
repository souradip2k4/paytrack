CREATE OR REPLACE FUNCTION create_default_categories () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO categories (name, user_id)
    VALUES ('Food', NEW.id), ('Travel', NEW.id), ('Sales', NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_insert_create_default_categories
AFTER INSERT ON "users" FOR EACH ROW
EXECUTE FUNCTION create_default_categories ();
