-- Run this SQL in your Supabase SQL Editor to enable raw SQL execution
-- from the "All Saarthi Head" panel and the migration scripts.

CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  IF LOWER(TRIM(sql)) LIKE 'select%' THEN
    EXECUTE 'SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (' || sql || ') t' INTO result;
  ELSE
    EXECUTE sql;
    result := '{"success": true}'::jsonb;
  END IF;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;
