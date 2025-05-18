-- Check the current constraint on the posts table
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'posts' AND con.conname = 'posts_category_check';

-- Check the current categories in the posts table
SELECT DISTINCT category FROM posts;
