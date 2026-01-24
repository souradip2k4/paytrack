/* ========================================================================== */
/* CATEGORY DELETION FUNCTIONS (with cascading delete on transactions) */
/* ========================================================================== */

/* Function to delete a category with optional cascading delete of transactions */
CREATE OR REPLACE FUNCTION delete_category(
    p_category_id UUID,
    p_cascade_delete BOOLEAN DEFAULT FALSE
)
RETURNS VOID
SECURITY INVOKER
AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    v_user_id := uid();

    -- If cascading delete is enabled, delete all transactions in this category
    IF p_cascade_delete THEN
        DELETE FROM transactions
        WHERE category_id = p_category_id
        AND user_id = v_user_id;
    END IF;

    DELETE FROM categories
    WHERE id = p_category_id
    AND user_id = v_user_id;
END;
$$ LANGUAGE plpgsql;

/* Grant execute permission to authenticated users */
REVOKE ALL ON FUNCTION delete_category(UUID, BOOLEAN) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_category(UUID, BOOLEAN) TO authenticated;