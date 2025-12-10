import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Executa migrations do banco de dados
 */
export async function runMigrations() {
  const dbPath = path.join(process.cwd(), 'data', 'blog.db');
  const sqlite = new Database(dbPath);
  
  try {
    // Ler arquivo de migration
    const migrationPath = path.join(process.cwd(), 'drizzle', '0000_init.sql');
    
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      sqlite.exec(migrationSQL);
      console.log('✅ Migration executada com sucesso');
    } else {
      // Criar tabela diretamente se migration não existir
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS "posts" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "slug" text NOT NULL,
          "title" text NOT NULL,
          "content" text NOT NULL,
          "excerpt" text,
          "description" text,
          "category" text NOT NULL,
          "language" text DEFAULT 'pt-br' NOT NULL,
          "author" text,
          "cover_image" text,
          "image_alt" text,
          "keywords" text,
          "tags" text,
          "date" text NOT NULL,
          "published" integer DEFAULT 0 NOT NULL,
          "featured" integer DEFAULT 0,
          "read_time" text,
          "generated_by" text,
          "score" integer,
          "sources" text,
          "created_at" text NOT NULL,
          "updated_at" text NOT NULL,
          "published_at" text
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_unique" ON "posts"("slug");
      `);
      console.log('✅ Tabela criada com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}
