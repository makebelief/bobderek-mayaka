import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html')).sort();
const expected = ['index.html','about.html','services.html','team.html','why-us.html','insights.html','contact.html','privacy.html','terms.html','404.html'];
const errors = [];

for (const f of expected) if (!htmlFiles.includes(f)) errors.push(`Missing page: ${f}`);

const allText = htmlFiles.map(f => fs.readFileSync(path.join(root,f),'utf8')).join('\n') + '\n' + fs.readFileSync(path.join(root,'assets/css/site.css'),'utf8') + '\n' + fs.readFileSync(path.join(root,'package.json'),'utf8');
const forbiddenReference = ['a','r','e','n','d','e'].join('');
if (allText.toLowerCase().includes(forbiddenReference)) errors.push('Reference-site name still appears in production files.');
if (/#[89][bB]4[aA][bB]0/.test(allText)) errors.push('Unexpected legacy colour token detected.');
if (!allText.includes('#1D374E') || !allText.includes('#AA9373')) errors.push('Primary Bobderek palette missing.');

const allowedExternal = [/^https:\/\/wa\.me\//, /^mailto:/, /^tel:/];
const usedContentImages = new Map();

for (const file of htmlFiles) {
  const full = path.join(root,file);
  const html = fs.readFileSync(full,'utf8');
  if (!/name="viewport"/.test(html)) errors.push(`${file}: missing viewport meta.`);
  if (!/assets\/css\/site\.css/.test(html)) errors.push(`${file}: missing local stylesheet.`);
  if (/https:\/\/[^"']+\.css/.test(html)) errors.push(`${file}: external stylesheet detected.`);
  if (/https:\/\/images\./.test(html)) errors.push(`${file}: external image detected.`);
  if (!/bobderek-mayaka\.vercel\.app/.test(html)) errors.push(`${file}: canonical project domain missing.`);

  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('#') || href.startsWith('http') || allowedExternal.some(r=>r.test(href))) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.join(root, clean);
    if (!fs.existsSync(target)) errors.push(`${file}: broken local link ${href}`);
  }

  for (const m of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)) {
    const tag = m[0], src = m[1];
    if (!/alt="[^"]*"/.test(tag)) errors.push(`${file}: image missing alt: ${src}`);
    if (src.startsWith('http')) { errors.push(`${file}: external image ${src}`); continue; }
    const target = path.join(root,src);
    if (!fs.existsSync(target)) errors.push(`${file}: missing image ${src}`);
    const isChrome = src.includes('bobderek-avatar.webp');
    if (!isChrome) {
      const key = src;
      const arr = usedContentImages.get(key) || [];
      arr.push(file);
      usedContentImages.set(key, arr);
    }
  }
}

for (const [src,files] of usedContentImages) {
  if (files.length > 1 && !src.includes('og-card')) errors.push(`Content image reused: ${src} in ${files.join(', ')}`);
}

const css = fs.readFileSync(path.join(root,'assets/css/site.css'),'utf8');
if (!/@media\(max-width:560px\)/.test(css)) errors.push('Small-phone responsive breakpoint missing.');
if (!/contact-rail/.test(css)) errors.push('Contact rail styling missing.');
if (!/overflow-x:hidden/.test(css)) errors.push('Horizontal overflow protection missing.');

if (errors.length) {
  console.error(`CHECK FAILED (${errors.length})`);
  for (const e of errors) console.error(' -',e);
  process.exit(1);
}
console.log(`CHECK PASSED: ${htmlFiles.length} HTML pages, local assets/links, Bobderek palette, unique content imagery and responsive safeguards verified.`);
