#!/usr/bin/env node
// build.js — Παίρνει κάθε client config + το template και βγάζει έτοιμο site στο dist/<slug>/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATE_PATH = path.join(ROOT, 'template.html');
const ADMIN_TEMPLATE_PATH = path.join(ROOT, 'admin-template.html');
const CLIENTS_DIR = path.join(ROOT, 'clients');
const DIST = path.join(ROOT, 'dist');

function rootVars(cfg) {
  const t = cfg.theme || {};
  const f = cfg.fonts || {};
  const lines = Object.entries(t).map(([k, v]) => `--${k}:${v};`);
  if (f.display) lines.push(`--font-display:${f.display};`);
  if (f.script) lines.push(`--font-script:${f.script};`);
  if (f.body) lines.push(`--font-body:${f.body};`);
  return ':root{' + lines.join('') + '}';
}

function build(cfg, template) {
  let html = template;
  html = html.replace('/*__THEME__*/', rootVars(cfg));
  html = html.replace('<!--__FONTS__-->', cfg.fonts && cfg.fonts.googleUrl
    ? `<link href="${cfg.fonts.googleUrl}" rel="stylesheet">` : '');
  html = html.replace(/__TITLE__/g, (cfg.shop.name + ' ' + (cfg.shop.nameSuffix || '')).trim());
  // Inject config. The template reads `CONFIG`.
  html = html.replace('/*__CONFIG__*/', 'const CONFIG = ' + JSON.stringify(cfg) + ';');
  return html;
}

function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) { console.error('✗ template.html not found'); process.exit(1); }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const adminTemplate = fs.existsSync(ADMIN_TEMPLATE_PATH) ? fs.readFileSync(ADMIN_TEMPLATE_PATH, 'utf8') : null;

  const files = fs.readdirSync(CLIENTS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));

  if (!files.length) { console.warn('⚠ Δεν βρέθηκαν clients στο clients/'); return; }

  const only = process.argv[2]; // optional: build μόνο έναν π.χ. `node build.js dante`
  let built = 0;

  for (const f of files) {
    const cfg = JSON.parse(fs.readFileSync(path.join(CLIENTS_DIR, f), 'utf8'));
    if (only && cfg.slug !== only) continue;

    // Public site
    const outDir = path.join(DIST, cfg.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), build(cfg, template));
    console.log(`✓ ${cfg.slug.padEnd(16)} → dist/${cfg.slug}/index.html`);

    // Admin site (if admin-template.html exists)
    if (adminTemplate) {
      const adminDir = path.join(DIST, cfg.slug + '-admin');
      fs.mkdirSync(adminDir, { recursive: true });
      fs.writeFileSync(path.join(adminDir, 'index.html'), build(cfg, adminTemplate));
      console.log(`✓ ${(cfg.slug + '-admin').padEnd(16)} → dist/${cfg.slug}-admin/index.html`);
    }

    built++;
  }

  console.log(`\n${built} site(s) built.`);
}

main();
