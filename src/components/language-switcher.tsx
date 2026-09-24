'use client';

import { usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@/i18n/config';

/**
 * PT/EN como controle segmentado do Nocturne.
 *
 * Era um menu suspenso com bandeira. Duas opções não justificam um menu —
 * e bandeira nomeia país, não idioma. Aqui as duas ficam à vista, e a ativa
 * se marca pelo contorno de acento, como qualquer outro `.seg` do sistema.
 */

const ROTULOS: Record<Locale, string> = {
  'pt-BR': 'PT',
  en: 'EN',
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const trocar = (novo: Locale) => {
    if (!pathname || novo === currentLocale) return;

    // O primeiro segmento é o idioma; o resto do caminho é preservado.
    const resto = pathname.split('/').slice(2).join('/');

    document.cookie = `NEXT_LOCALE=${novo};path=/;max-age=31536000;SameSite=Lax`;
    router.push(`/${novo}${resto ? `/${resto}` : ''}`);
    router.refresh();
  };

  return (
    <div className="seg" role="group" aria-label="Idioma">
      {i18n.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          className="seg-opt"
          aria-current={locale === currentLocale}
          onClick={() => trocar(locale)}
        >
          {ROTULOS[locale]}
        </button>
      ))}
    </div>
  );
}
