export type ConsultationLanguage = 'ko' | 'en' | 'ja' | 'zh';
type Topic = 'verification' | 'keywords' | 'website' | 'ads' | 'reviews' | 'international' | 'ai' | 'content' | 'local' | 'reddit' | 'product' | 'clinic';
type Copy = [heading: string, description: string, button: string];

const copy: Record<ConsultationLanguage, Record<Topic, Copy>> = {
  ko: {
    reddit: ['우리 서비스와 관련된 레딧 질문은 어떻게 찾을까요?', '대상 고객과 알리고 싶은 서비스를 알려주세요. 관련 질문을 찾고 답변 콘텐츠를 준비하는 범위를 함께 살펴보겠습니다.', '레딧 마케팅 운영 상담하기'],
    product: ['우리 사업장의 상담 업무에 맞는지 먼저 이야기해볼까요?', '현재 쓰는 상담 채널과 반복해서 불편한 일을 알려주세요. 필요한 기능과 도입 범위를 확인해 안내해드리겠습니다.', '상담 관리 제품 도입 문의하기'],
    clinic: ['우리 병원의 마케팅은 어떤 업무부터 맡기면 좋을까요?', '진료 분야와 대상 고객, 현재 운영 중인 채널을 알려주세요. Google 프로필과 홈페이지·콘텐츠 중 필요한 업무를 정리해보겠습니다.', '병원 마케팅 작업 범위 상담하기'],
    verification: ['인증이 막힌 단계부터 확인해볼까요?', '매장 주소와 인증 과정에서 막힌 부분을 알려주세요. 확인할 항목과 필요한 작업 범위를 안내해드리겠습니다.', '프로필 인증 문제 상담하기'],
    keywords: ['우리 서비스를 찾는 검색어부터 함께 살펴볼까요?', '현재 홈페이지 주소와 더 알리고 싶은 서비스를 남겨주세요. 검색어 기획과 페이지 보완 중 필요한 범위를 이야기해보겠습니다.', '홈페이지 검색어 기획 상담하기'],
    website: ['지금 홈페이지에서 무엇을 보완하면 좋을까요?', '기존 사이트 주소와 필요한 언어·페이지를 알려주세요. 현재 사이트를 활용할 수 있는 부분과 추가할 작업을 살펴보겠습니다.', '홈페이지 개선·제작 상담하기'],
    ads: ['광고를 맡기기 전, 예산과 진행 범위를 정해볼까요?', '업종과 목표 고객, 생각하시는 예산을 알려주세요. 현재 준비 상태를 보고 광고와 사전 정비의 범위를 함께 정리하겠습니다.', '광고 예산·운영 범위 상담하기'],
    reviews: ['우리 매장의 리뷰 관리는 어디부터 손보면 좋을까요?', 'Google 프로필 주소와 리뷰 운영에서 어려운 점을 남겨주세요. 요청·응대·정보 관리 중 필요한 작업을 살펴보겠습니다.', 'Google 리뷰 운영 상담하기'],
    international: ['우리 업종은 외국인 고객 유치를 어디서 시작할까요?', '업종과 지역, 만나고 싶은 고객을 알려주세요. Google 프로필과 다국어 안내, 문의 경로 중 먼저 준비할 일을 정리해드리겠습니다.', '외국인 고객 유치 상담하기'],
    ai: ['AI 검색 대응, 우리 회사에는 어느 범위가 필요할까요?', '현재 홈페이지와 해결하고 싶은 질문을 알려주세요. 정보 보완·콘텐츠 작성·점검 중 필요한 업무부터 이야기하실 수 있습니다.', 'AEO·GEO 작업 범위 상담하기'],
    content: ['검색한 고객이 읽을 내용부터 함께 정리해볼까요?', '알리고 싶은 서비스와 기존 글을 알려주세요. 새로 쓸 내용과 기존 페이지에서 보완할 부분을 살펴보겠습니다.', '검색 콘텐츠 운영 상담하기'],
    local: ['우리 매장의 Google 검색·지도 현황부터 살펴볼까요?', 'Google 프로필 주소와 운영 중 어려운 점을 알려주세요. 기본 정보와 콘텐츠, 문의 경로에서 필요한 작업을 안내해드리겠습니다.', 'Google 프로필 운영 상담하기'],
  },
  en: {
    reddit: ['How can you find Reddit questions relevant to your service?', 'Tell us about your target customers and services. We can discuss finding relevant questions and preparing useful responses.', 'Discuss Reddit marketing'],
    product: ['Would the product fit the way your business handles inquiries?', 'Tell us which channels you use and which recurring tasks cause difficulty. We can discuss the functions and setup you need.', 'Ask about inquiry management products'],
    clinic: ['Which marketing tasks does your clinic need help with?', 'Share your clinical services, target patients and current channels. We can discuss Google profile, website and content work.', 'Discuss clinic marketing services'],
    verification: ['Where is your profile verification getting stuck?', 'Share your business listing and the step you cannot complete. We can discuss what to check and what assistance you may need.', 'Discuss a verification issue'],
    keywords: ['Which searches could bring new customers to your website?', 'Share your website and the services you want more people to find. We can discuss keyword planning and the pages that need attention.', 'Discuss website keyword planning'],
    website: ['What does your current website need?', 'Send your website address and the languages or pages you need. We can look at what you can keep and what work to add.', 'Discuss your website project'],
    ads: ['Decide on the scope and budget before hiring an ads agency', 'Tell us about your business, target customers and proposed budget. We can discuss campaign management and the preparation needed first.', 'Discuss ad scope and budget'],
    reviews: ['Where should you start with Google review management?', 'Share your Business Profile and the review tasks you find difficult. We can discuss review requests, responses and profile information.', 'Discuss Google review management'],
    international: ['Where should your business start with international customers?', 'Tell us your industry, location and target customers. We can discuss your Google profile, multilingual information and inquiry process.', 'Discuss international customer marketing'],
    ai: ['How much AI search support does your company need?', 'Share your website and the question you want to address. We can discuss information updates, content and checks that fit your needs.', 'Discuss the scope of AEO and GEO work'],
    content: ['What do customers need to read before contacting you?', 'Share your services and existing articles. We can look at what to update and which topics need new content.', 'Discuss search content'],
    local: ['Start with your visibility on Google Search and Maps', 'Share your Business Profile and what you need help managing. We can discuss profile information, content and inquiry paths.', 'Discuss Google Business Profile management'],
  },
  ja: {
    reddit: ['自社のサービスに関連するRedditの質問を探しませんか？', '対象のお客様と紹介したいサービスをお知らせください。関連する質問を探し、回答コンテンツを準備する範囲をご相談いただけます。', 'Redditマーケティングを相談する'],
    product: ['自社の相談業務に合う製品か、まずお話ししませんか？', '現在の相談チャネルと、繰り返し手間がかかる業務をお知らせください。必要な機能と導入範囲を確認してご案内します。', '相談管理製品の導入について問い合わせる'],
    clinic: ['医院のマーケティングは、どの業務から依頼しましょうか？', '診療分野と対象の患者さん、現在の運用チャネルをお知らせください。Googleのプロフィール、サイト、コンテンツのうち必要な業務を整理します。', '医院のマーケティング業務を相談する'],
    verification: ['プロフィールのオーナー確認は、どの段階で止まっていますか？', '店舗のプロフィールと、確認手続きで進めない箇所をお知らせください。確認すべき項目と必要な作業をご案内します。', 'オーナー確認について相談する'],
    keywords: ['新規のお客様が使う検索語句から考えてみませんか？', '現在のサイトと、もっと知ってほしいサービスをお知らせください。検索語句の選定とページの改善についてご相談いただけます。', 'サイトの検索キーワードを相談する'],
    website: ['今のサイトには、どのような改善が必要でしょうか？', 'サイトのURLと、必要な言語・ページをお知らせください。既存サイトを活用できる部分と追加する作業を確認します。', 'サイトの改善・制作を相談する'],
    ads: ['広告を依頼する前に、予算と業務範囲を整理しませんか？', '業種と対象のお客様、ご予算をお知らせください。現在の準備状況を見ながら、広告運用と事前整備の範囲をご相談いただけます。', '広告の予算・運用範囲を相談する'],
    reviews: ['Googleのクチコミ管理は、何から見直すとよいでしょうか？', 'ビジネスプロフィールと運用上のお悩みをお知らせください。クチコミの依頼・返信・情報管理で必要な作業を確認します。', 'Googleのクチコミ管理を相談する'],
    international: ['外国人のお客様の集客は、どこから始めましょうか？', '業種と地域、対象のお客様をお知らせください。Googleのプロフィール、多言語案内、お問い合わせの流れから準備することを整理します。', '外国人のお客様の集客を相談する'],
    ai: ['自社には、どこまでAI検索への対応が必要でしょうか？', '現在のサイトと解決したい疑問をお知らせください。情報の更新、コンテンツ制作、調査のうち必要な業務からご相談いただけます。', 'AEO・GEOの業務範囲を相談する'],
    content: ['検索したお客様に伝える内容から整理しませんか？', '紹介したいサービスと既存の記事をお知らせください。新たに書く内容と、既存ページで補う点を確認します。', '検索向けコンテンツの運用を相談する'],
    local: ['Google検索・マップでの店舗の現状を確認しませんか？', 'ビジネスプロフィールと運用上のお悩みをお知らせください。基本情報、コンテンツ、お問い合わせの流れで必要な作業をご案内します。', 'ビジネスプロフィールの運用を相談する'],
  },
  zh: {
    reddit: ['如何寻找与您的服务相关的Reddit问题？', '请告诉我们目标客户和希望推广的服务。我们可以讨论如何查找相关问题，以及准备回答内容的工作范围。', '咨询Reddit营销运营'],
    product: ['先聊聊产品是否适合您的咨询工作', '请告诉我们目前使用的咨询渠道，以及反复遇到的工作难题。我们会确认所需功能和导入范围，再作说明。', '咨询客户咨询管理产品'],
    clinic: ['医院营销该从哪些工作开始委托？', '请告诉我们诊疗领域、目标患者和正在运营的渠道。我们可以梳理Google商家资料、网站和内容方面需要的工作。', '咨询医院营销服务范围'],
    verification: ['商家资料验证卡在哪一步？', '请提供商家资料链接，并说明无法完成的验证步骤。我们可以一起确认需要检查的项目和协助范围。', '咨询商家资料验证问题'],
    keywords: ['新客户会用哪些关键词找到您的服务？', '请留下网站地址和希望推广的服务。我们可以讨论关键词规划，以及需要补充的页面内容。', '咨询网站关键词规划'],
    website: ['现有网站需要补充哪些内容？', '请提供网站地址，以及需要的语言和页面。我们会查看可以沿用的部分，并讨论需要增加的工作。', '咨询网站改进与制作'],
    ads: ['委托投放广告前，先确定预算与工作范围', '请告诉我们您的行业、目标客户和预算。我们可以根据现有准备情况，讨论广告投放和前期整理的范围。', '咨询广告预算与运营范围'],
    reviews: ['Google评价管理该从哪里着手？', '请提供商家资料链接和评价管理中遇到的问题。我们可以讨论评价邀请、回复和资料维护方面的工作。', '咨询Google评价管理'],
    international: ['您的行业该如何开始吸引外国客户？', '请告诉我们您的行业、地区和目标客户。我们会从Google商家资料、多语言说明和咨询流程中梳理需要先准备的事项。', '咨询外国客户营销'],
    ai: ['您的企业需要多大范围的AI搜索支持？', '请提供网站和希望解决的问题。我们可以从资料更新、内容制作和检查中讨论您需要的工作。', '咨询AEO与GEO服务范围'],
    content: ['先梳理客户搜索后需要阅读的内容', '请告诉我们希望推广的服务，并提供现有文章。我们可以讨论需要新写的内容，以及现有页面需要补充的部分。', '咨询搜索内容运营'],
    local: ['先了解商家在Google搜索和地图上的现状', '请提供商家资料链接和运营中遇到的问题。我们会讨论基本信息、内容和咨询路径中需要处理的事项。', '咨询Google商家资料管理'],
  },
};

export function getBlogConsultation(post: { id: string; title: string }, language: ConsultationLanguage = 'ko') {
  const text = post.title;
  const topic: Topic = /인증|소유권/.test(text) ? 'verification'
    : post.id === 'homepage-seo-new-customer-keywords' ? 'keywords'
    : /레딧|Reddit/i.test(text) ? 'reddit'
    : /닥터네스트|뷰티네스트/.test(text) ? 'product'
    : /의료법|병원 마케팅 대행사/.test(text) ? 'clinic'
    : /홈페이지|웹사이트|랜딩/.test(text) ? 'website'
    : /구글.?광고|Google Ads|광고비|예산/.test(text) ? 'ads'
    : /리뷰/.test(text) ? 'reviews'
    : /AEO|GEO|AI|ChatGPT|Perplexity|챗지피티/i.test(text) ? 'ai'
    : /콘텐츠|블로그|SEO/.test(text) ? 'content'
    : /외국인|관광객|해외/.test(text) ? 'international' : 'local';
  const [heading, description, button] = copy[language][topic];
  return { topic, heading, description, button };
}
