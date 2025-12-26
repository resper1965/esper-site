-- Migração: Garantir que todos os posts tenham categoria
-- Atualiza posts sem categoria ou com categoria vazia para 'general'

UPDATE posts
SET category = 'general'
WHERE category IS NULL 
   OR category = ''
   OR TRIM(category) = '';

-- Adicionar constraint para garantir que categoria nunca seja NULL ou vazia
ALTER TABLE posts
ADD CONSTRAINT posts_category_not_empty 
CHECK (category IS NOT NULL AND TRIM(category) != '');

-- Comentário
COMMENT ON CONSTRAINT posts_category_not_empty ON posts IS 'Garante que todos os posts tenham uma categoria válida';

