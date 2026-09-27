import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html')).sort();
const errors = [];
const docs = new Map(pages.map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]));
const strip = v => v.split(/[?#]/)[0];
const isExternal = v => /^(https?:|mailto:|tel:|data:|javascript:)/i.test(v);
const allowedRepeat = new Set(['images/bobderek-mayaka-logo.png','images/bobderek-mayaka-mark.png']);
const imageUse = new Map();

function idsIn(html){ return new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1])); }
const idsByPage = new Map([...docs].map(([f,h])=>[f,idsIn(h)]));

for (const [file, html] of docs) {
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  const dups=ids.filter((x,i)=>ids.indexOf(x)!==i);
  if(dups.length) errors.push(`${file}: duplicate IDs ${[...new Set(dups)].join(', ')}`);

  for (const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const v=m[1];
    if (v === '#' || /^javascript:/i.test(v)) errors.push(`${file}: dead link ${v}`);
    if (isExternal(v)) continue;
    if (v.startsWith('#')) {
      const id=v.slice(1); if(id && !idsByPage.get(file)?.has(id)) errors.push(`${file}: missing local anchor #${id}`);
      continue;
    }
    const [target,frag] = v.split('#');
    const rel=strip(target);
    if (rel && !fs.existsSync(path.join(root,rel))) errors.push(`${file}: missing local reference ${v}`);
    if (frag && rel.endsWith('.html')) {
      const targetHtml=docs.get(rel);
      if(!targetHtml || !idsIn(targetHtml).has(frag)) errors.push(`${file}: missing target anchor ${v}`);
    }
  }

  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)) {
    const v=m[1];
    if(!allowedRepeat.has(v)) imageUse.set(v,(imageUse.get(v)||0)+1);
    if(!/\balt=["'][^"']*["']/.test(m[0])) errors.push(`${file}: image missing alt: ${v}`);
  }

  if (/Aren(?:de) Oriri|Kevin\s+Aren(?:de)|aren(?:de)-oriri-advocates|\+254\s*722\s*948\s*247/i.test(html)) errors.push(`${file}: stale reference-brand content`);
  if (!/^40[34]\.html$|^50[03]\.html$/.test(file) && !/bobderek-mayaka\.vercel\.app/i.test(html)) errors.push(`${file}: Bobderek canonical/domain not found`);
}

for (const [img,count] of imageUse) {
  if(count>1 && !img.startsWith('images/bobderek-')) errors.push(`non-profile content image repeated ${count}×: ${img}`);
}

for (const cssFile of ['assets/css/site.css','assets/css/pages.css']) {
  const css=fs.readFileSync(path.join(root,cssFile),'utf8');
  for (const m of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const v=m[1]; if (/^(data:|https?:)/i.test(v)) continue;
    const abs=path.resolve(path.dirname(path.join(root,cssFile)),v);
    if(!fs.existsSync(abs)) errors.push(`${cssFile}: missing CSS asset ${v}`);
  }
}
const css=['assets/css/site.css','assets/css/pages.css'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const purplePatterns=[/#8B4AB0/i,/#6D3F7C/i,/#6B347F/i,/#765C7A/i,/rgba\(139\s*,\s*74\s*,\s*176/i,/rgba\(109\s*,\s*63\s*,\s*124/i];
if(purplePatterns.some(r=>r.test(css))) errors.push('legacy purple color found in CSS');
if(!css.includes('#1D374E')||!css.includes('#B9966A')) errors.push('Bobderek navy/gold palette missing');
const js=fs.readFileSync(path.join(root,'assets/js/site.js'),'utf8');
if(!js.includes('254746565756')) errors.push('quick-contact phone is not Bobderek number');
if(!js.includes("prefers-reduced-motion")) errors.push('reduced-motion handling missing');

if(errors.length){ console.error('\nCHECK FAILED'); errors.forEach(e=>console.error(' - '+e)); process.exit(1); }
console.log(`CHECK PASSED: ${pages.length} pages; links, anchors, assets, image alts, unique non-profile imagery, Bobderek branding/palette and responsive interaction safeguards verified.`);
