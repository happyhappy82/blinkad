export type NestProduct = 'doctornest' | 'beautynest';
export const NEST_PRODUCTS = { doctornest: '닥터네스트', beautynest: '뷰티네스트' } as const;
export const NEST_UPDATED_AT = '2026-09-27';
export const NEST_ARTICLES = [
  {
    "id": "h1",
    "slug": "dagteoneseuteulan-byeong-ueon-sangdam-eul-hanalo-moeuneun-bangsig-jeongli",
    "product": "doctornest",
    "concern": "inbox",
    "label": "여러 채널의 문의 관리",
    "cta": "우리 병원 문의 관리 상담하기",
    "footerCopy": "카카오톡과 DM에서 답변 여부를 다시 찾고 있나요? 지금 쓰는 채널을 알려주시면 연결 가능 여부와 상담 이력을 확인하는 방법을 안내해 드리겠습니다.",
    "title": "카카오톡·DM으로 흩어진 병원 문의, 한곳에서 관리하려면"
  },
  {
    "id": "h2",
    "slug": "doctornest-consultation-manual-handover",
    "product": "doctornest",
    "concern": "consultation_guidance",
    "label": "가격·행사 안내 기준",
    "cta": "상담 안내 정리 문의하기",
    "footerCopy": "직원마다 가격이나 행사 조건을 다르게 안내하나요? 자주 엇갈리는 항목을 알려주시면 공통 문구와 고객별 상담 기록을 어떻게 쓸지 설명해 드리겠습니다.",
    "title": "가격·행사 안내가 직원마다 다를 때, 상담 기준을 맞추는 방법"
  },
  {
    "id": "h3",
    "slug": "oigug-in-hoanja-yuchi-google-maps-mun-euileul-silje-yeyag-eulo-bakkuneun-sangdam-dongseon",
    "product": "doctornest",
    "concern": "foreign_consultation",
    "label": "외국인 환자 상담",
    "cta": "외국인 상담 운영 문의하기",
    "footerCopy": "번역한 대화와 다음 직원이 할 일을 따로 정리하고 있나요? 자주 받는 언어와 채널을 알려주시면 원문·번역·상담 메모를 함께 확인하는 방법을 안내해 드리겠습니다.",
    "title": "외국인 환자 문의, 번역부터 다음 상담까지 어떻게 이어갈까?"
  },
  {
    "id": "h4",
    "slug": "3-byeong-ueon-allimtog-yeyagsisul-hujaebangmun-mesijineun-eonje-bonaeya-halkka",
    "product": "doctornest",
    "concern": "appointment_followup",
    "label": "예약 확인·변경·후속 안내",
    "cta": "예약 후 안내 상담하기",
    "footerCopy": "예약을 변경한 뒤 장부와 안내 메시지를 각각 확인하고 있나요? 지금 쓰는 예약 방식과 연락 채널을 알려주시면 확인할 순서를 함께 정리해 드리겠습니다.",
    "title": "예약 확인·변경 연락을 놓치지 않으려면 무엇을 정리해야 할까?"
  },
  {
    "id": "h5",
    "slug": "byutineseuteulan-miyongsilneilsyab-sangdamgoa-jaebangmun-eul-han-hoamyeon-eseo-boneun-bangsig",
    "product": "beautynest",
    "concern": "customer_records",
    "label": "고객 기록·다음 방문 안내",
    "cta": "우리 매장 고객관리 상담하기",
    "footerCopy": "손님에게 연락하기 전에 지난 상담과 시술 기록을 여러 곳에서 찾고 있나요? 기록을 남기는 곳과 보내고 싶은 안내를 알려주시면 뷰티네스트에서 어떻게 확인할지 설명해 드리겠습니다.",
    "title": "뷰티 매장 고객관리, 상담 기록과 다음 안내를 함께 챙기는 법"
  },
  {
    "id": "h6",
    "slug": "byeong-ueon-maketing-goanggo-yuib-eul-sangdamyeyagjaebangmun-eulo-yeongyeolhaneun-bangbeob",
    "product": "doctornest",
    "concern": "campaign_inquiries",
    "label": "광고 문의·예약 기록",
    "cta": "광고 문의 관리 상담하기",
    "footerCopy": "광고 보고서와 상담·예약 기록을 맞춰 보기 어렵나요? 문의가 들어오는 채널을 알려주시면 상담 메모에 무엇을 남기고 예약 결과를 어디서 확인할지 안내해 드리겠습니다.",
    "title": "광고로 들어온 문의, 예약까지 어디에 기록해야 할까?"
  }
] as const;
export type NestArticle = (typeof NEST_ARTICLES)[number];

export function resolveNestArticle(service?: string, topic?: string): NestArticle | undefined {
  if (service !== 'doctornest' && service !== 'beautynest') return undefined;
  return NEST_ARTICLES.find(article => article.id === topic && article.product === service)
    ?? NEST_ARTICLES.find(article => article.product === service);
}
