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

// 마크다운을 HTML로 변환하는 간단한 함수
function markdownToHtml(markdown) {
  return markdown
    // 헤딩
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 볼드
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 이탤릭
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 링크
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // 리스트
    .replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>')
    // 줄바꿈
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    // 문단 감싸기
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<h') || match.startsWith('<li') || match.startsWith('<p') || match.startsWith('</')) {
        return match;
      }
      return `<p>${match}</p>`;
    });
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

    // 필터 구성 (Status 타입에 따라 다르게)
    let filter = undefined;
    if (statusProp?.type === 'status') {
      filter = {
        property: statusProp.name || 'Status',
        status: {
          equals: 'Published',
        },
      };
    } else if (statusProp?.type === 'select') {
      filter = {
        property: statusProp.name || 'Status',
        select: {
          equals: 'Published',
        },
      };
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

      // 제목 추출
      const titleProperty = properties.Title || properties.Name || properties['제목'];
      const title = titleProperty?.title?.[0]?.plain_text || 'Untitled';

      // 카테고리 추출
      const categoryProperty = properties.Category || properties['카테고리'];
      const category = categoryProperty?.select?.name || 'General';

      // 날짜 추출
      const dateProperty = properties.Date || properties['날짜'];
      const date = dateProperty?.date?.start || new Date().toISOString().split('T')[0];

      // 요약 추출
      const excerptProperty = properties.Excerpt || properties.Summary || properties['요약'];
      const excerpt = excerptProperty?.rich_text?.[0]?.plain_text || '';

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
      const content = markdownToHtml(mdString.parent || mdString);

      posts.push({
        id: page.id.replace(/-/g, ''),
        title,
        category,
        date: formatDate(date),
        excerpt,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
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

// constants.ts 파일 업데이트
async function updateConstants(posts) {
  const constantsPath = path.join(__dirname, '..', 'src', 'constants.ts');
  let constantsContent = fs.readFileSync(constantsPath, 'utf-8');

  // BLOG_POSTS 배열 생성
  const blogPostsArray = `export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};`;

  // 기존 BLOG_POSTS 배열 교체
  const blogPostsRegex = /export const BLOG_POSTS: BlogPost\[\] = \[[\s\S]*?\];/;

  if (blogPostsRegex.test(constantsContent)) {
    constantsContent = constantsContent.replace(blogPostsRegex, blogPostsArray);
  } else {
    // BLOG_POSTS가 없으면 파일 끝에 추가
    constantsContent += `\n\n${blogPostsArray}\n`;
  }

  fs.writeFileSync(constantsPath, constantsContent, 'utf-8');
  console.log(`Updated constants.ts with ${posts.length} posts`);
}

// 메인 실행
async function main() {
  console.log('Starting Notion sync...');

  if (!process.env.NOTION_API_KEY) {
    console.error('Error: NOTION_API_KEY is not set');
    process.exit(1);
  }

  if (!process.env.NOTION_DATABASE_ID) {
    console.error('Error: NOTION_DATABASE_ID is not set');
    process.exit(1);
  }

  const posts = await fetchNotionPosts();
  console.log(`Fetched ${posts.length} posts from Notion`);

  if (posts.length > 0) {
    await updateConstants(posts);
    console.log('Sync completed successfully!');
  } else {
    console.log('No published posts found');
  }
}

main().catch(console.error);
