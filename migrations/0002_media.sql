-- ============================================================
-- Mídia — as fotos ficam no R2, os metadados aqui.
--
-- Arrastar arquivo para o painel do R2 produz um balde de chaves sem
-- resposta para "de que viagem é esta foto?". A tabela existe para isso:
-- é ela que transforma armazenamento em galeria.
--
-- O byte nunca entra no D1. Aqui só o que descreve.
-- ============================================================

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  -- Chave do objeto no bucket. Única: é o endereço do arquivo.
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  -- Orientação EXIF preservada (1–8). O resto do EXIF é descartado no upload.
  orientation INTEGER,

  -- A que se refere. `collection` é livre para não amarrar a mídia a
  -- viagens: amanhã serve para palestras ou imprensa sem migração.
  collection TEXT NOT NULL DEFAULT 'viagens',
  -- Id da entrada dona — para viagens, o slug da travessia.
  owner_id TEXT,

  -- Legenda e alt são campos distintos de propósito: um é editorial, o
  -- outro é acessibilidade. Juntá-los produz alt ruim ou legenda seca.
  caption_pt TEXT,
  caption_en TEXT,
  alt_pt TEXT,
  alt_en TEXT,

  -- Quando a foto foi feita, não quando subiu. Informado por quem sobe,
  -- porque a data original saiu junto com o EXIF — de propósito.
  taken_on TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_collection ON media (collection, owner_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_media_published ON media (published);
