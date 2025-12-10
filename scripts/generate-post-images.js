#!/usr/bin/env node

/**
 * Gera thumbnails discretos e em escala de cinza para cada post MDX.
 * Por padrão lê `blog/content` e grava os PNGs em `public/thumbnails`.
 *
 * Exemplos:
 *   node scripts/generate-post-images.js
 *   node scripts/generate-post-images.js --slug=viagens-seguranca-digital
 *   node scripts/generate-post-images.js --dir=blog/content --out=public/thumbnails
 */

const fs = require('fs/promises');
const path = require('path');

(async () => {
  const { ImageResponse } = await import('@vercel/og');
  const matter = (await import('gray-matter')).default;
  const React = await import('react');
  const { createElement } = React;

  const args = process.argv.slice(2);
  const dirArg = args.find((arg) => arg.startsWith('--dir='));
  const outArg = args.find((arg) => arg.startsWith('--out='));
  const slugArg = args.find((arg) => arg.startsWith('--slug='));

  const sourceDir = dirArg
    ? path.resolve(process.cwd(), dirArg.split('=')[1])
    : path.join(process.cwd(), 'blog/content');
  const outputDir = outArg
    ? path.resolve(process.cwd(), outArg.split('=')[1])
    : path.join(process.cwd(), 'public/thumbnails');
  const slugFilter = slugArg ? slugArg.split('=')[1] : null;

  const THEMES = {
    cyber: {
      label: 'Cibersegurança',
      background: ['#040404', '#141414'],
      glow: '#d0d0d0',
      accent: '#f5f5f5',
      muted: '#9ca3af',
      motif: 'grid',
    },
    counter: {
      label: 'Contraespionagem',
      background: ['#020202', '#0d0d0d'],
      glow: '#dcdcdc',
      accent: '#f3f4f6',
      muted: '#a1a1aa',
      motif: 'scan',
    },
    home: {
      label: 'Automação Segura',
      background: ['#050505', '#111111'],
      glow: '#d6d6d6',
      accent: '#f4f4f5',
      muted: '#a3a3a3',
      motif: 'circuit',
    },
    travel: {
      label: 'Segurança em Viagens',
      background: ['#030303', '#0f0f0f'],
      glow: '#e0e0e0',
      accent: '#f8f8f8',
      muted: '#b0b0b0',
      motif: 'lines',
    },
    default: {
      label: 'Segurança Digital',
      background: ['#050505', '#151515'],
      glow: '#d8d8d8',
      accent: '#f2f2f2',
      muted: '#b1b1b1',
      motif: 'grain',
    },
  };

  const TAG_THEME = {
    'ciberseguranca': 'cyber',
    'cibersegurança': 'cyber',
    'automacao residencial': 'home',
    'automação residencial': 'home',
    'contraespionagem': 'counter',
    'viagens': 'travel',
  };

  const SLUG_HINTS = [
    { needle: 'automacao', theme: 'home' },
    { needle: 'home', theme: 'home' },
    { needle: 'contraespionagem', theme: 'counter' },
    { needle: 'tscm', theme: 'counter' },
    { needle: 'viagem', theme: 'travel' },
    { needle: 'travel', theme: 'travel' },
    { needle: 'ot-', theme: 'cyber' },
    { needle: 'ransomware', theme: 'cyber' },
  ];

  const truncate = (text, limit = 92) =>
    text.length > limit ? `${text.substring(0, limit - 3)}...` : text;

  const normalize = (value = '') =>
    value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const ensureDir = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
  };

  const pickThemeKey = (tags = [], slug = '') => {
    for (const tag of tags) {
      const key = TAG_THEME[normalize(tag)];
      if (key) return key;
    }
    const normalizedSlug = normalize(slug);
    for (const hint of SLUG_HINTS) {
      if (normalizedSlug.includes(hint.needle)) {
        return hint.theme;
      }
    }
    return 'default';
  };

  const createPatternLayer = (theme) => {
    const baseStyle = {
      position: 'absolute',
      inset: 0,
      opacity: 0.6,
      zIndex: 1,
      pointerEvents: 'none',
    };

    switch (theme.motif) {
      case 'grid':
        return createElement('div', {
          style: {
            ...baseStyle,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '140px 140px, 140px 140px',
          },
        });
      case 'scan':
        return createElement('div', {
          style: {
            ...baseStyle,
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
            backgroundSize: '100% 120px',
          },
        });
      case 'circuit':
        return createElement('div', {
          style: {
            ...baseStyle,
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '90px 90px, 60px 60px',
          },
        });
      case 'lines':
        return createElement('div', {
          style: {
            ...baseStyle,
            backgroundImage:
              'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 55%)',
            backgroundSize: '220px 220px',
          },
        });
      default:
        return createElement('div', {
          style: {
            ...baseStyle,
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 0, transparent 55%)',
          },
        });
    }
  };

  const buildCard = ({ title, slug, theme, tags }) => {
    const displayTitle = truncate(title);
    const tagLine = tags && tags.length ? tags.join(' • ') : theme.label;

    return createElement(
      'div',
      {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${theme.background[0]}, ${theme.background[1]})`,
          color: '#f8fafc',
          padding: '80px',
          position: 'relative',
          fontFamily:
            "Inter, 'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif",
        },
      },
      createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 25% 20%, ${theme.glow}22, transparent 55%)`,
          zIndex: 1,
        },
      }),
      createPatternLayer(theme),
      createElement(
        'div',
        {
          style: {
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '32px',
          },
        },
        createElement(
          'div',
          {
            style: {
              textTransform: 'uppercase',
              letterSpacing: '6px',
              fontSize: '18px',
              color: theme.muted,
            },
          },
          theme.label
        ),
        createElement(
          'div',
          {
            style: {
              fontSize: '64px',
              fontWeight: 600,
              lineHeight: 1.2,
              color: theme.accent,
            },
          },
          displayTitle
        ),
        createElement('div', {
          style: {
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            color: theme.muted,
          },
          children: [
            createElement(
              'div',
              {
                key: 'tags',
                style: {
                  fontSize: '20px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                },
              },
              tagLine
            ),
            createElement(
              'div',
              {
                key: 'footer',
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '18px',
                  fontSize: '18px',
                },
              },
              createElement(
                'div',
                { key: 'slug', style: { letterSpacing: '3px' } },
                slug.replace(/-/g, ' · ')
              ),
              createElement('div', { key: 'brand' }, 'esper.ws')
            ),
          ],
        })
      )
    );
  };

  const files = (await fs.readdir(sourceDir)).filter((file) =>
    file.endsWith('.mdx')
  );

  if (!files.length) {
    console.warn(`Nenhum post encontrado em ${sourceDir}`);
    process.exit(0);
  }

  await ensureDir(outputDir);

  let generated = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const { data } = matter(content);

    const slug =
      (data.slug && data.slug.toString().trim()) ||
      file.replace(/\.mdx$/, '');

    if (slugFilter && slug !== slugFilter) {
      continue;
    }

    const title = data.title || slug;
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const themeKey = pickThemeKey(tags, slug);
    const theme = THEMES[themeKey] || THEMES.default;

    const card = buildCard({ title, slug, theme, tags });
    const response = new ImageResponse(card, {
      width: 1200,
      height: 630,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const assetPath = path.join(outputDir, `${slug}.png`);
    await fs.writeFile(assetPath, buffer);

    generated += 1;
    console.log(`✓ ${slug} (${theme.label})`);
  }

  console.log(`\n${generated} thumbnail(s) gerados em ${outputDir}`);
})().catch((error) => {
  console.error('Erro ao gerar thumbnails:', error);
  process.exit(1);
});
