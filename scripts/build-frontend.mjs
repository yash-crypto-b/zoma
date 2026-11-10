import { cp, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
process.env.SITE_URL ||= process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://zomareel.com';
const origin = new URL(process.env.SITE_URL).origin;
const { PAGE_PATHS, CONTENT_UPDATED } = await import('../server/src/site/data.js');

await mkdir(output, { recursive: true });
for (const directory of ['assets', 'js']) {
  await cp(new URL(`client/${directory}/`, root), new URL(`${directory}/`, output), { recursive: true });
}
await mkdir(new URL('app/', output), { recursive: true });
await cp(new URL('client/index.html', root), new URL('app/index.html', output));

for (const pathname of PAGE_PATHS) {
  const page = pathname === '/' ? 'home' : pathname.slice(1);
  const module = await import(`../server/src/site/pages/${page}.js`);
  const render = module[`render${page[0].toUpperCase()}${page.slice(1)}`];
  const directory = new URL(pathname === '/' ? './' : `${page}/`, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), render({ path: pathname }));
}

const { renderNotFound } = await import('../server/src/site/layout.js');
await writeFile(new URL('404.html', output), renderNotFound({ path: '/404' }));
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${PAGE_PATHS.map(path => `<url><loc>${origin}${path}</loc><lastmod>${CONTENT_UPDATED}</lastmod></url>`).join('')}</urlset>\n`);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built ${PAGE_PATHS.length} marketing pages and the application in ${fileURLToPath(output)}`);
