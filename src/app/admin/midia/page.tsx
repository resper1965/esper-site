'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { UploadCloud, Trash2, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { journeys } from '@/lib/journeys';

interface MediaRecord {
  id: string;
  r2_key: string;
  content_type: string;
  size_bytes: number;
  owner_id: string | null;
  caption_pt: string | null;
  alt_pt: string | null;
  taken_on: string | null;
  published: number;
}

/** As viagens conhecidas viram opções, para a foto nascer já ligada a uma. */
const OWNERS = journeys.map((j) => ({
  id: `${j.name['pt-BR'].toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${j.year}`,
  label: `${j.name['pt-BR']} (${j.year})`,
}));

export default function MidiaPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [owner, setOwner] = useState(OWNERS[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/media?collection=viagens');
    if (res.ok) setMedia(((await res.json()) as { media: MediaRecord[] }).media);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = (await res.json()) as { authenticated?: boolean };
        if (!data.authenticated) return router.push('/admin/login');
        setCheckingAuth(false);
        await load();
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router, load]);

  /**
   * Envia uma foto por vez, de propósito.
   *
   * Mandar cinquenta em paralelo derruba o limite de taxa e transforma um
   * erro em cinquenta. Em série, cada recusa é atribuível a um arquivo — e
   * é isso que o painel precisa dizer.
   */
  async function upload(files: FileList) {
    setBusy(true);
    setErrors([]);
    const found: string[] = [];
    const list = Array.from(files);

    for (let i = 0; i < list.length; i++) {
      setProgress({ done: i, total: list.length });
      const form = new FormData();
      form.append('file', list[i]);
      form.append('collection', 'viagens');
      if (owner) form.append('ownerId', owner);
      // O nome do arquivo não vira chave (isso é gerado no servidor), mas
      // serve de legenda provisória para você se achar na lista.
      form.append('captionPt', list[i].name.replace(/\.[^.]+$/, ''));

      const res = await fetch('/api/admin/media', { method: 'POST', body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        found.push(`${list[i].name}: ${body.error ?? res.statusText}`);
      }
    }

    setProgress(null);
    setErrors(found);
    setBusy(false);
    await load();
  }

  async function togglePublished(m: MediaRecord) {
    await fetch(`/api/admin/media/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: m.published !== 1 }),
    });
    await load();
  }

  async function remove(m: MediaRecord) {
    if (!confirm('Apagar esta foto? A remoção do arquivo é definitiva.')) return;
    await fetch(`/api/admin/media/${m.id}`, { method: 'DELETE' });
    await load();
  }

  if (checkingAuth) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Verificando sessão…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-4 text-sm text-emerald-200">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Os metadados são removidos no envio: GPS, número de série da câmera e horário não sobem
            junto. Só a orientação é preservada, para a foto não deitar. O tipo é verificado pelos
            bytes do arquivo, não pela extensão — SVG é recusado.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-4">
          <label className="block text-sm text-slate-300">
            Viagem
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              {OWNERS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-700 p-8 text-slate-400 hover:border-slate-500">
            {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
            <span className="text-sm">
              {progress
                ? `Enviando ${progress.done + 1} de ${progress.total}…`
                : 'Escolher fotos (pode selecionar várias)'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => e.target.files?.length && upload(e.target.files)}
            />
          </label>

          {errors.length > 0 && (
            <div className="space-y-1 rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4" /> {errors.length} arquivo(s) recusado(s)
              </div>
              <ul className="list-disc pl-5">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm text-slate-400">
            {media.length} foto(s) · {media.filter((m) => m.published === 1).length} publicada(s).
            Só as publicadas aparecem no site.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <figure key={m.id} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/${m.r2_key}`}
                  alt={m.alt_pt ?? m.caption_pt ?? 'Foto de viagem'}
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="space-y-2 p-2 text-xs text-slate-400">
                  <p className="truncate">{m.caption_pt ?? m.r2_key}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => togglePublished(m)}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {m.published === 1 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {m.published === 1 ? 'Publicada' : 'Oculta'}
                    </button>
                    <button onClick={() => remove(m)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
