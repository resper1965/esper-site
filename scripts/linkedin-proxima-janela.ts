/**
 * Diz se já dá para publicar no LinkedIn hoje, ou quantos dias úteis faltam.
 *
 * Lê `orm/linkedin/posts/` — a fonte de verdade já existe ali, um arquivo
 * por post, com a data no nome. Nada de estado duplicado.
 *
 * Sai com código 1 quando ainda não está liberado: isto é trava, não aviso.
 * Rodar antes de qualquer chamada às ferramentas do MCP do LinkedIn.
 *
 *   npx tsx scripts/linkedin-proxima-janela.ts
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ultimoPostEm, proximaJanela } from '../src/lib/linkedin/cadencia';

const MINIMO_DIAS_UTEIS = 5;
const PASTA = join(__dirname, '..', 'orm', 'linkedin', 'posts');

function main() {
  const arquivos = readdirSync(PASTA);
  const ultimo = ultimoPostEm(arquivos);
  const janela = proximaJanela(ultimo, new Date(), MINIMO_DIAS_UTEIS);

  if (!ultimo) {
    console.log('Nenhum post anterior encontrado. Liberado.');
    return;
  }

  console.log(`Último post: ${ultimo} (${janela.diasUteisDecorridos} dia(s) útil(eis) atrás)`);

  if (janela.liberado) {
    console.log(`Liberado — passou o mínimo de ${MINIMO_DIAS_UTEIS} dias úteis.`);
    return;
  }

  console.log(
    `Bloqueado — faltam ${janela.diasUteisFaltando} dia(s) útil(eis) para completar o mínimo de ${MINIMO_DIAS_UTEIS}.`
  );
  process.exit(1);
}

main();
