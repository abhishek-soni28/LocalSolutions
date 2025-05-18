-- Drop the existing constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;

-- Add the new constraint with updated values
ALTER TABLE posts ADD CONSTRAINT posts_category_check 
CHECK (category IN ('GENERAL', 'PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'CLEANING', 'FOOD', 'GROCERY', 'OTHER'));
