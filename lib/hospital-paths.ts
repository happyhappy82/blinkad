export const HOSPITAL_SERVICE_LINK = { href: '/hospital-marketing', label: '병원마케팅' }
export const HOSPITAL_UPDATED_AT = '2026-11-24'

export const hospitalPaths = {
  'hospital-marketing': HOSPITAL_SERVICE_LINK.href,
  'agency-selection': '/blog/byeong-ueon-maketing-daehaengsa-goleuneun-beob-goanggo-bogoseoboda-sangdam-jeonhoan-eul-boseyo',
  'hospital-geo': '/blog/hoanjaga-chatgpte-gangnam-chigoa-chucheon-mul-eobomyeon-uli-byeong-ueon-i-an-naoneun-iyu',
  'hospital-website': '/blog/hospital-website-ai-search',
  'website-cost': '/blog/hospital-website-cost-scope',
  'foreign-patients': '/blog/hospital-foreign-marketing',
  'hospital-work': '/hospital-marketing/cases',
} as const

export type HospitalTopic = keyof typeof hospitalPaths

const topicsByPath = new Map<string, HospitalTopic>(
  (Object.keys(hospitalPaths) as HospitalTopic[]).map(topic => [hospitalPaths[topic], topic]),
)

export function hospitalBlogTopic(postId: string) {
  return topicsByPath.get(`/blog/${postId}`)
}
