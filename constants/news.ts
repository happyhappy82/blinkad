export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

export const NEWS_POSTS: NewsPost[] = [
  {
    id: 'blinkad-news-board-open',
    title: '블링크애드 회사소식 게시판을 오픈했습니다',
    excerpt: '블링크애드의 서비스 업데이트, 운영 공지, 브랜드 소식을 별도 공간에서 전합니다.',
    date: '2026.07.15',
    category: '공지',
    content: `
      <p>블링크애드의 회사소식을 별도로 확인할 수 있는 게시판을 오픈했습니다.</p>
      <p>기존 블로그는 구글 마케팅, 외국인마케팅, AEO·GEO 인사이트 중심으로 운영하고, 회사소식은 서비스 업데이트와 운영 공지 중심으로 분리해 관리합니다.</p>
      <h2>앞으로 다룰 소식</h2>
      <ul>
        <li>블링크애드 서비스 업데이트</li>
        <li>운영 공지와 고객 안내</li>
        <li>프로젝트 및 브랜드 활동 소식</li>
        <li>채용, 제휴, 파트너십 관련 안내</li>
      </ul>
      <p>중요한 변경 사항은 이 게시판을 통해 순차적으로 안내드리겠습니다.</p>
    `,
  },
];
