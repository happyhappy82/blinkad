import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 마크다운을 HTML로 변환하는 함수
function markdownToHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let html = markdown;

  // 코드 블록 임시 보존 (```로 감싸진 부분)
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    codeBlocks.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 인라인 코드 처리
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 헤딩 처리 (순서 중요: h3 -> h2 -> h1)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // 수평선
  html = html.replace(/^---$/gm, '<hr/>');
  html = html.replace(/^\*\*\*$/gm, '<hr/>');

  // 볼드 & 이탤릭 (순서 중요)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // 취소선
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 이미지
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4"/>');

  // 인용구
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // 테이블 처리 - 셀 안 줄바꿈 지원 (리스트보다 먼저 처리해야 함)
  const lines = html.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 표 시작 감지: |로 시작하고 |로 끝나는 줄
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];

      // 표 전체 수집
      while (i < lines.length) {
        const currentLine = lines[i];
        // |로 시작하거나, 이전에 |로 끝나지 않은 행의 연속
        if (currentLine.trim().startsWith('|') ||
            (tableLines.length > 0 && !tableLines[tableLines.length - 1].trim().endsWith('|') && currentLine.trim())) {
          tableLines.push(currentLine);
          i++;
        } else if (!currentLine.trim()) {
          // 빈 줄이면 표 끝
          break;
        } else {
          break;
        }
      }

      // |로 끝나는 줄까지를 하나의 행으로 합침
      const rows = [];
      let currentRow = '';
      for (const tline of tableLines) {
        currentRow += (currentRow ? '\n' : '') + tline;
        if (tline.trim().endsWith('|')) {
          rows.push(currentRow);
          currentRow = '';
        }
      }
      if (currentRow) rows.push(currentRow);

      // 최소 2행 필요
      if (rows.length >= 2) {
        const isSeparatorRow = (row) => {
          const cells = row.split('|').map(c => c.trim()).filter(c => c);
          return cells.length > 0 && cells.every(c => /^[-:\s]+$/.test(c));
        };

        const processCell = (cell) => cell.trim().replace(/\n/g, '<br/>');

        const headerCells = rows[0].split('|')
          .map(c => c.trim()).filter(c => c)
          .map(c => `<th class="border border-gray-700 px-4 py-2 text-left bg-gray-800 font-semibold">${processCell(c)}</th>`)
          .join('');

        const bodyRows = rows.slice(1)
          .filter(row => !isSeparatorRow(row))
          .map(row => {
            const cells = row.split('|').map(c => c.trim()).filter(c => c)
              .map(c => `<td class="border border-gray-700 px-4 py-2">${processCell(c)}</td>`).join('');
            return cells ? `<tr>${cells}</tr>` : '';
          })
          .filter(r => r).join('\n');

        result.push(`<table class="w-full border-collapse my-6 text-sm">
<thead><tr>${headerCells}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>`);
      } else {
        result.push(...tableLines);
      }
    } else {
      result.push(line);
      i++;
    }
  }

  html = result.join('\n');

  // 순서 없는 리스트 (테이블 처리 후에 실행)
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');

  // 순서 있는 리스트
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // 연속된 li 태그를 ul로 감싸기
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // 빈 줄로 구분된 문단 처리
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';

    // 이미 HTML 태그로 감싸진 경우 그대로 유지
    if (
      para.startsWith('<h') ||
      para.startsWith('<ul') ||
      para.startsWith('<ol') ||
      para.startsWith('<li') ||
      para.startsWith('<blockquote') ||
      para.startsWith('<pre') ||
      para.startsWith('<table') ||
      para.startsWith('<hr') ||
      para.startsWith('<img') ||
      para.startsWith('__CODE_BLOCK_')
    ) {
      return para;
    }

    // 줄바꿈을 <br/>로 변환
    para = para.replace(/\n/g, '<br/>');
    return `<p>${para}</p>`;
  }).join('\n');

  // 코드 블록 복원
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });

  // 빈 태그 정리
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html.trim();
}

// HTML 특수문자 이스케이프
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  return text.replace(/[&<>]/g, m => map[m]);
}

// 노션 데이터베이스에서 게시글 가져오기
async function fetchNotionPosts() {
  try {
    console.log('Fetching posts from Notion database...');

    // 먼저 데이터베이스 구조 확인
    const dbInfo = await notion.databases.retrieve({ database_id: DATABASE_ID });
    console.log('Database properties:', Object.keys(dbInfo.properties));

    // Status 필드 타입 확인
    const statusProp = dbInfo.properties.Status || dbInfo.properties['상태'];
    console.log('Status property type:', statusProp?.type);

    // 오늘 날짜 (KST 기준)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    console.log('Filtering posts with date on or before:', todayStr);

    // 필터 구성 (Status + Date 조건)
    let statusFilter = undefined;
    if (statusProp?.type === 'status') {
      statusFilter = {
        property: statusProp.name || 'Status',
        status: {
          equals: 'Published',
        },
      };
    } else if (statusProp?.type === 'select') {
      statusFilter = {
        property: statusProp.name || 'Status',
        select: {
          equals: 'Published',
        },
      };
    }

    // Date 필터 (오늘 이전 날짜만)
    const dateFilter = {
      property: 'Date',
      date: {
        on_or_before: todayStr,
      },
    };

    // Status와 Date 필터 결합
    let filter = undefined;
    if (statusFilter) {
      filter = {
        and: [statusFilter, dateFilter],
      };
    } else {
      filter = dateFilter;
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts = [];

    for (const page of response.results) {
      console.log(`Processing: ${page.id}`);

      // 페이지 속성 추출
      const properties = page.properties;

      // 제목 추출 (rich_text 전체 합치기)
      const titleProperty = properties.Title || properties.Name || properties['제목'];
      const title = (titleProperty?.title || [])
        .map(t => t.plain_text)
        .join('')
        .trim() || 'Untitled';

      // 카테고리 추출
      const categoryProperty = properties.Category || properties['카테고리'];
      const category = categoryProperty?.select?.name || 'General';

      // 날짜 추출
      const dateProperty = properties.Date || properties['날짜'];
      const date = dateProperty?.date?.start || new Date().toISOString().split('T')[0];

      // 요약 추출 (rich_text 전체 합치기)
      const excerptProperty = properties.Excerpt || properties.Summary || properties['요약'];
      const excerpt = (excerptProperty?.rich_text || [])
        .map(t => t.plain_text)
        .join('')
        .trim();

      // 이미지 URL 추출
      const imageProperty = properties.Image || properties.Cover || properties['이미지'];
      let imageUrl = '';
      if (imageProperty?.files?.[0]) {
        const file = imageProperty.files[0];
        imageUrl = file.file?.url || file.external?.url || '';
      }
      // 커버 이미지가 있으면 사용
      if (!imageUrl && page.cover) {
        imageUrl = page.cover.file?.url || page.cover.external?.url || '';
      }

      // 페이지 컨텐츠를 마크다운으로 변환
      const mdBlocks = await n2m.pageToMarkdown(page.id);
      const mdString = n2m.toMarkdownString(mdBlocks);
      const rawContent = typeof mdString === 'string' ? mdString : (mdString.parent || '');
      const content = markdownToHtml(rawContent);

      posts.push({
        id: page.id.replace(/-/g, ''),
        title,
        category,
        date: formatDate(date),
        excerpt,
        imageUrl: imageUrl || '',
        content,
      });
    }

    return posts;
  } catch (error) {
    console.error('Error fetching Notion posts:', error);
    throw error;
  }
}

// 날짜 포맷팅
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// 기존 BLOG_POSTS에서 ID 목록 추출
function getExistingPostIds() {
  const constantsPath = path.join(__dirname, '..', 'constants', 'index.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf-8');

  // BLOG_POSTS 배열에서 id 값들 추출
  const idRegex = /"id":\s*"([^"]+)"/g;
  const blogPostsMatch = constantsContent.match(/export const BLOG_POSTS: BlogPost\[\] = \[([\s\S]*?)\];/);

  if (!blogPostsMatch) {
    console.log('No existing BLOG_POSTS found');
    return new Set();
  }

  const existingIds = new Set();
  let match;
  while ((match = idRegex.exec(blogPostsMatch[1])) !== null) {
    existingIds.add(match[1]);
  }

  console.log(`Found ${existingIds.size} existing posts`);
  return existingIds;
}

// 기존 BLOG_POSTS 배열 파싱
function getExistingPosts() {
  const constantsPath = path.join(__dirname, '..', 'constants', 'index.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf-8');

  const blogPostsMatch = constantsContent.match(/export const BLOG_POSTS: BlogPost\[\] = (\[[\s\S]*?\]);/);

  if (!blogPostsMatch) {
    console.log('No existing BLOG_POSTS found');
    return [];
  }

  try {
    // JSON 파싱을 위해 약간의 정리
    const jsonStr = blogPostsMatch[1];
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log('Failed to parse existing posts, starting fresh');
    return [];
  }
}

// constants/index.ts 파일 업데이트 (새 글만 추가)
async function updateConstants(newPosts) {
  const constantsPath = path.join(__dirname, '..', 'constants', 'index.ts');
  let constantsContent = fs.readFileSync(constantsPath, 'utf-8');

  // 기존 포스트 ID 목록 가져오기
  const existingIds = getExistingPostIds();
  const existingPosts = getExistingPosts();

  // 새 포스트 중 기존에 없는 것만 필터링
  const trulyNewPosts = newPosts.filter(post => !existingIds.has(post.id));

  if (trulyNewPosts.length === 0) {
    console.log('No new posts to add');
    return false;
  }

  console.log(`Adding ${trulyNewPosts.length} new posts:`);
  trulyNewPosts.forEach(post => console.log(`  - ${post.title} (${post.id})`));

  // 새 포스트를 기존 포스트 앞에 추가 (최신순)
  const allPosts = [...trulyNewPosts, ...existingPosts];

  // 날짜순으로 정렬 (최신이 먼저)
  allPosts.sort((a, b) => {
    const dateA = a.date.replace(/\./g, '-');
    const dateB = b.date.replace(/\./g, '-');
    return dateB.localeCompare(dateA);
  });

  // BLOG_POSTS 배열 생성
  const blogPostsArray = `export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(allPosts, null, 2)};`;

  // 기존 BLOG_POSTS 배열 교체
  const blogPostsRegex = /export const BLOG_POSTS: BlogPost\[\] = \[[\s\S]*?\];/;

  if (blogPostsRegex.test(constantsContent)) {
    constantsContent = constantsContent.replace(blogPostsRegex, blogPostsArray);
  } else {
    // BLOG_POSTS가 없으면 파일 끝에 추가
    constantsContent += `\n\n${blogPostsArray}\n`;
  }

  fs.writeFileSync(constantsPath, constantsContent, 'utf-8');
  console.log(`Updated constants/index.ts - Total: ${allPosts.length} posts (${trulyNewPosts.length} new)`);
  return true;
}

// 메인 실행
async function main() {
  console.log('Starting Notion sync...');
  console.log(`Current time: ${new Date().toISOString()}`);

  if (!process.env.NOTION_API_KEY) {
    console.error('Error: NOTION_API_KEY is not set');
    process.exit(1);
  }

  if (!process.env.NOTION_DATABASE_ID) {
    console.error('Error: NOTION_DATABASE_ID is not set');
    process.exit(1);
  }

  const posts = await fetchNotionPosts();
  console.log(`Fetched ${posts.length} eligible posts from Notion (date <= today)`);

  if (posts.length > 0) {
    const hasChanges = await updateConstants(posts);
    if (hasChanges) {
      console.log('Sync completed - new posts added!');
    } else {
      console.log('Sync completed - no new posts to add');
    }
  } else {
    console.log('No published posts found with eligible dates');
  }
}

main().catch(console.error);
