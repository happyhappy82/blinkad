import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const constants = fs.readFileSync(path.join(root, 'constants/index.ts'), 'utf8');
const posts = JSON.parse(constants.match(/export const BLOG_POSTS: BlogPost\[\] = (\[[\s\S]*?\]);/)[1]);
const sync = fs.readFileSync(path.join(root, 'scripts/fetch-notion-posts.js'), 'utf8');
const ids = [
  'gangnam-seonghyeong-oigoa-oigug-in-maketing-ilbonjunggugyeong-eogueon-geomsaeg-eul-mun-euilo-yeongyeolhalyeomyeon',
  'hongdae-miyongsil-oigug-in-maketing-google-mapsoa-instagram-mun-euileul-yeyag-eulo-bakkuneun-beob',
  'myeongdong-pibugoa-oigug-in-maketing-dangi-chelyu-hoanjaeui-geomsaeg-eul-yeyag-eulo-yeongyeolhaneun-beob',
];

for (const id of ids) {
  test(`published article is complete and unique: ${id}`, () => {
    const matches = posts.filter(p => p.id === id);
    assert.equal(matches.length, 1);
    const post = matches[0];
    assert.equal(post.date, '2026.09.26');
    assert.equal(post.category, 'AEO CONTENT');
    assert.ok(post.excerpt.length > 50);
    assert.equal(post.imageUrl, '');
    assert.doesNotMatch(post.title, /\[오픈애즈\]/);
    assert.doesNotMatch(post.content, /<h1>|<script|reviewNotes|ready=true|수정률|SequenceMatcher/);
    const tableCount = (post.content.match(/<table\b/g) || []).length;
    assert.ok(tableCount >= 2);
    assert.equal((post.content.match(/aria-label="가로로 스크롤할 수 있는 비교표" tabindex="0"/g) || []).length, tableCount);
    assert.equal((post.content.match(/<table style="min-width:36rem">/g) || []).length, tableCount);
    const faq = post.content.split('<h2>자주 묻는 질문</h2>')[1].split(/<h3>확인한 자료|<p><strong>확인한 자료/)[0];
    assert.equal((faq.match(/<h3>/g) || []).length, 3);
    assert.match(post.content, /utm_source=blinkad_blog/);
    assert.match(post.content, /utm_campaign=local_foreign_marketing/);
    assert.match(post.content, /2026년 9월 1[78]일/);
    assert.match(post.content, /이후 (변경|달라질)/);
    for (const [, href] of post.content.matchAll(/href="([^"]+)"/g)) {
      assert.equal(new URL(href.replaceAll('&amp;', '&')).protocol, 'https:');
    }
  });
}

test('Notion synchronization preserves manual articles without any real IO or API calls', async () => {
  let output;
  const context = vm.createContext({
    fs: { readFileSync: () => constants, writeFileSync: (_file, data) => { output = data; } },
    path,
    __dirname: path.join(root, 'scripts'),
    console: { log() {} },
  });
  const manual = sync.match(/const MANUAL_STATIC_POST_IDS = new Set\(\[[\s\S]*?\]\);/)[0];
  const functions = sync.slice(sync.indexOf('function getExistingPosts()'), sync.indexOf('// 메인 실행'));
  vm.runInContext(`${manual}\n${functions}\nglobalThis.manualIds = [...MANUAL_STATIC_POST_IDS];`, context);
  for (const id of ids) assert.ok(context.manualIds.includes(id));
  context.incoming = posts.filter(p => !context.manualIds.includes(p.id));
  await vm.runInContext('updateConstants(incoming)', context);
  const merged = JSON.parse(output.match(/export const BLOG_POSTS: BlogPost\[\] = (\[[\s\S]*?\]);/)[1]);
  assert.equal(merged.length, posts.length);
  for (const post of posts) assert.deepEqual(merged.find(p => p.id === post.id), post);
});
