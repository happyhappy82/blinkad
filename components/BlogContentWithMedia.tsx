import BlogInquiryGapFigure from './BlogInquiryGapFigure'

const TARGET_POST = 'google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka'
const INSERT_AFTER = '<p>이 표는 원인을 확정하는 공식이 아닙니다. 다만 모든 문제를 노출 부족으로 몰아가지 않고, 점검 순서를 정하는 데 쓸 수 있습니다.</p>'

interface Props {
  postId: string
  html: string
  className: string
}

export default function BlogContentWithMedia({ postId, html, className }: Props) {
  const markerPosition = postId === TARGET_POST ? html.indexOf(INSERT_AFTER) : -1

  if (markerPosition < 0) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  }

  const splitAt = markerPosition + INSERT_AFTER.length

  return (
    <>
      <div className={className} dangerouslySetInnerHTML={{ __html: html.slice(0, splitAt) }} />
      <BlogInquiryGapFigure />
      <div className={className} dangerouslySetInnerHTML={{ __html: html.slice(splitAt) }} />
    </>
  )
}
