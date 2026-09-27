/** Build-time localization: one source layout, language dictionaries, no browser translator. */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = ['', 'services', 'foreign-marketing', 'google-map-marketing', 'blog-marketing', 'aeo', 'reddit-marketing', 'case-studies', 'contact', 'news', 'news/[slug]'];
const components = ['Navbar', 'Footer', 'Hero', 'BrandSystem', 'Services', 'AIDiagnostic', 'MethodStack', 'Process', 'FAQ', 'Contact', 'CaseStudies', 'DiagnosisContactPage', 'DiagnosisModal', 'NestInquiry'];
const files = [
  ...routes.map(route => `app/(korean)/${route ? route + '/' : ''}page.tsx`),
  ...components.map(name => `components/${name}.tsx`),
  'constants/index.ts', 'constants/news.ts', 'lib/nest-content.ts',
];
const mirrored = new Set(files);
const normalize = text => text.replace(/\s+/g, ' ').trim();
const korean = /[가-힣]/;
const inventory = new Map();
const language = process.argv.find(arg => arg.startsWith('--language='))?.split('=')[1] || 'en';
if (!['en', 'ja', 'zh'].includes(language)) throw new Error('Unsupported language');
const dictionary = JSON.parse(fs.readFileSync(path.join(root, `i18n/${language}.json`), 'utf8'));
const missing = new Set();
const output = path.join(root, `localized/${language}`);
const routePaths = ['/', '/blog', '/hospital-sample', '/restaurant-sample', ...routes.filter(Boolean).map(route => '/' + route)];

function localPath(value) {
  const absolute = value.startsWith('https://www.blinkad.kr/');
  const relative = absolute ? value.slice('https://www.blinkad.kr'.length) : value;
  const pathname = relative.split(/[?#]/)[0];
  if (!routePaths.includes(pathname) && !/^\/news\/[^/.]*$/.test(pathname)) return value;
  return (absolute ? 'https://www.blinkad.kr' : '') + '/' + language + (pathname === '/' ? relative.slice(1) : relative);
}

for (const file of files) {
  let source = fs.readFileSync(path.join(root, file), 'utf8');
  if (file === 'constants/index.ts') {
    // The Korean article archive remains its own source; never copy its bodies into the English bundle.
    source = source.slice(0, source.indexOf('export const BLOG_POSTS'));
  }
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  function replace(node, value) { edits.push({ start: node.getStart(ast), end: node.end, value }); }
  function visit(node) {
    if (ts.isStringLiteralLike(node) || ts.isJsxText(node) || [ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail].includes(node.kind)) {
      let value = node.text;
      if (ts.isStringLiteral(node) && (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent))) {
        if (value.startsWith('.') || value.startsWith('@/')) {
          const candidate = value.startsWith('@/') ? value.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(file), value));
          const resolved = [candidate + '.tsx', candidate + '.ts', candidate + '/index.ts'].find(name => fs.existsSync(path.join(root, name)));
          if (resolved) value = '@/' + (mirrored.has(resolved) ? `localized/${language}/` : '') + resolved.replace(/\.(tsx?|jsx?)$/, '');
        }
      } else {
        const isSearchKeyword = ts.isPropertyAssignment(node.parent) && node.parent.name.getText(ast) === 'keyword';
        if (korean.test(value) && !isSearchKeyword) {
          const key = normalize(value);
          if (!inventory.has(key)) inventory.set(key, { key, file });
          if (!(key in dictionary)) missing.add(key);
          else {
            value = dictionary[key];
            if ([ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail].includes(node.kind)) {
              value = (node.text.match(/^\s+/)?.[0] || '') + value + (node.text.match(/\s+$/)?.[0] || '');
            }
          }
        }
        if (value === 'ko_KR') value = { en: 'en_US', ja: 'ja_JP', zh: 'zh_CN' }[language];
        if (value === 'ko-KR') value = { en: 'en', ja: 'ja', zh: 'zh-Hans' }[language];
        value = localPath(value);
      }
      if (value !== node.text) {
        if (ts.isJsxText(node)) replace(node, `{${JSON.stringify(value)}}`);
        else if (ts.isStringLiteral(node)) replace(node, JSON.stringify(value));
        else {
          const escaped = value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
          const head = node.kind === ts.SyntaxKind.TemplateHead || ts.isNoSubstitutionTemplateLiteral(node) ? '`' : '}';
          const tail = node.kind === ts.SyntaxKind.TemplateHead || node.kind === ts.SyntaxKind.TemplateMiddle ? '${' : '`';
          replace(node, head + escaped + tail);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  // The approved English homepage headline is intentionally different from the source slogan.
  if (language === 'en' && file === 'app/(korean)/page.tsx') {
    if ((source.match(/<Hero \/>/g) || []).length !== 1) throw new Error('Expected one homepage Hero');
    source = 'import { englishHomeCopy } from "@/i18n/site";\n' + source.replace('<Hero />', '<Hero heading={englishHomeCopy.heading} />');
  }
  // English forms accept international numbers without changing the Korean form or receiver schema.
  if (['Contact', 'DiagnosisModal', 'NestInquiry'].some(name => file === `components/${name}.tsx`)) {
    source = source.replace(/const phoneRegex = .*?;/, '')
      .replace(/return phoneRegex\.test\(phone\.replace\(\/\\s\/g, ''\)\);/, 'return validInternationalPhone(phone);')
      .replace(/!\/\^\(01\[0-9\].*?\.test\(data\.phone\.replace\(\/\\s\/g, ''\)\)/, '!validInternationalPhone(data.phone)')
      .replaceAll('010-1234-5678', '+82 10 1234 5678')
      .replace(/(['"]use client['"];)/, '$1\nimport { validInternationalPhone } from "@/lib/site-languages";');
  }
  const target = path.join(output, file);
  if (!process.argv.includes('--inventory')) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `// Generated by scripts/build-english.mjs. Edit the Korean source or i18n/${language}.json.\n` + source);
  }
}

if (!process.argv.includes('--inventory') && !missing.size) {
  const imports = routes.map((route, index) => `import * as M${index} from './app/(korean)/${route ? route + '/' : ''}page'`).join('\n');
  const pages = routes.map((route, index) => !['contact', 'news/[slug]'].includes(route) ? `${JSON.stringify(route)}: M${index}` : null).filter(Boolean).join(', ');
  fs.writeFileSync(path.join(output, 'routes.tsx'), `${imports}
import { createLocalizedSite } from '@/lib/create-localized-site'
import { NEWS_POSTS } from './constants/news'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
const site = createLocalizedSite('${language}', { pages: { ${pages} }, Contact: M${routes.indexOf('contact')}, NewsPost: M${routes.indexOf('news/[slug]')}, news: NEWS_POSTS, Navbar, Footer })
export const generateStaticParams = site.generateStaticParams
export const generateMetadata = site.generateMetadata
export default site.Page
`);
}

if (process.argv.includes('--inventory')) {
  console.log(JSON.stringify([...inventory.values()].map((entry, index) => ({ id: index, ...entry })), null, 2));
} else if (missing.size) {
  console.error(`Missing ${missing.size} ${language} translations:\n` + [...missing].join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${language} build: ${files.length} shared modules, ${inventory.size} translated strings.`);
}
