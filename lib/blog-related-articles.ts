import type { SiteLanguage } from './site-languages'

type RelatedArticleLink = {
  id: string
  description: Record<SiteLanguage, string>
}

export type RelatedBlogArticle = {
  id: string
  title: string
  description: string
}

const verification = 'gbp-injeung-an-doil-ttae-ileohge-haegyeolhaseyo'
const visibility = 'gugeul-jidoe-gage-deungloghaessneunde-an-tteubnida-ueon-ingoa-haegyeolbeob-5gaji'
const inquiries = 'google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka'
const agency = 'gbp-un-yeong-daehaeng-eotteon-eobchee-matgyeoya-halkka-2026'

// Editorial choices for the two reviewed articles. Keep the order independent of publication dates.
const RELATED_ARTICLES: Readonly<Partial<Record<string, readonly RelatedArticleLink[]>>> = {
  [verification]: [
    {
      id: visibility,
      description: {
        ko: '인증을 마쳤는데도 가게가 안 보인다면, 등록 정보와 카테고리·지도 위치를 차례로 확인해 보세요.',
        en: 'If you have completed verification but still cannot find the business, check its details, category and map location.',
        ja: 'オーナー確認を済ませてもお店が見つからないときは、登録情報、カテゴリ、地図上の位置を順に確認しましょう。',
        zh: '验证完成后仍找不到门店，可以依次检查登记信息、类别和地图位置。',
      },
    },
    {
      id: agency,
      description: {
        ko: '대행사에 맡길 때는 사업주 소유권과 관리 권한, 계약 종료 후 인계 조건을 먼저 확인해 보세요.',
        en: 'Before asking an agency for help, check who retains ownership, what access the agency needs and how the handover works.',
        ja: '代行会社に依頼する前に、お店が保つオーナー権限、管理範囲、契約終了時の引き継ぎ条件を確認しましょう。',
        zh: '委托服务商协助之前，先确认商家所有权、管理权限和结束合作后的交接条件。',
      },
    },
    {
      id: inquiries,
      description: {
        ko: '가게가 지도에 표시되기 시작했다면, 조회 이후 전화·웹사이트·예약으로 이어지는 과정도 살펴보세요.',
        en: 'Once the business appears on Maps, check what happens after a profile view: calls, website visits and bookings.',
        ja: 'マップにお店が表示されるようになったら、閲覧後の電話、サイト訪問、予約までの流れも見てみましょう。',
        zh: '门店能在地图上找到后，再看看顾客浏览资料之后，是否继续拨打电话、访问网站或预约。',
      },
    },
  ],
  [visibility]: [
    {
      id: verification,
      description: {
        ko: '관리 화면에 인증 필요나 검토 중 안내가 보인다면, 코드·영상·소유권 문제별 확인 방법을 살펴보세요.',
        en: 'If the profile asks for verification or is under review, check the guidance for codes, video and ownership issues.',
        ja: '管理画面に確認が必要、または審査中と表示される場合は、コード、動画、オーナー権限ごとの確認方法をご覧ください。',
        zh: '如果管理页面提示需要验证或仍在审核，可以查看验证码、视频和所有权问题的处理方法。',
      },
    },
    {
      id: inquiries,
      description: {
        ko: '상호명으로는 보이는데 문의가 없다면, 검색어와 프로필 조회·클릭·연락 경로를 나눠 확인해 보세요.',
        en: 'If the business appears in name searches but gets no inquiries, review the search terms, profile views, clicks and steps to get in touch.',
        ja: '店名では見つかるのに問い合わせがないときは、検索語句、閲覧、クリック、連絡までを分けて確認しましょう。',
        zh: '如果搜店名能找到却没有咨询，可以分开检查搜索词、资料浏览、点击和联系流程。',
      },
    },
    {
      id: agency,
      description: {
        ko: '직접 관리하기 어려워 대행을 검토한다면, 작업 범위와 보고서·권한·인계 조건부터 비교해 보세요.',
        en: 'If you are considering outside help, compare the scope of work, reports, access permissions and handover terms.',
        ja: '自分たちでの管理が難しく代行を検討するなら、作業範囲、報告内容、権限、引き継ぎ条件から比べてみましょう。',
        zh: '如果打算委托服务商管理，可以先比较工作范围、报告内容、权限和交接条件。',
      },
    },
  ],
}

export function hasCuratedRelatedArticles(articleId: string): boolean {
  return Boolean(RELATED_ARTICLES[articleId])
}

export function getRelatedBlogArticles(
  articleId: string,
  posts: readonly { id: string; title: string }[],
  language: SiteLanguage,
): RelatedBlogArticle[] {
  return (RELATED_ARTICLES[articleId] || []).flatMap(link => {
    const post = posts.find(item => item.id === link.id)
    if (!post || post.id === articleId) return []
    return [{ id: post.id, title: post.title, description: link.description[language] }]
  })
}
