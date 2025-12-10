import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Caminho do banco de dados
const dbPath = path.join(process.cwd(), 'data', 'blog.db');

// Garantir que o diretório existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Criar conexão com o banco
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL'); // Write-Ahead Logging para melhor performance

// Criar instância do Drizzle
export const db = drizzle(sqlite, { schema });

// Exportar schema
export { schema };

// Função para fechar conexão (útil para testes)
export function closeDb() {
  sqlite.close();
}
