import BlogInquiryGapFigure from './BlogInquiryGapFigure'
import BlogLanguageSwitchFigure from './BlogLanguageSwitchFigure'

const MEDIA_INSERTIONS = [
  {
    postId: 'google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka',
    after: '<p>이 표는 원인을 확정하는 공식이 아닙니다. 다만 모든 문제를 노출 부족으로 몰아가지 않고, 점검 순서를 정하는 데 쓸 수 있습니다.</p>',
    Figure: BlogInquiryGapFigure,
  },
  {
    postId: 'add-multilingual-pages-existing-hospital-website',
    after: '<p>이렇게 나누면 <strong>이번에 필요한 추가 작업의 견적</strong>을 요청하기 쉽습니다. 실제 비용은 추가 제작과 기존 시스템 연동 범위를 확인한 뒤 비교하셔야 합니다.</p>',
    Figure: BlogLanguageSwitchFigure,
  },
]

interface Props {
  postId: string
  html: string
  className: string
}

export default function BlogContentWithMedia({ postId, html, className }: Props) {
  const insertion = MEDIA_INSERTIONS.find(item => item.postId === postId)
  const markerPosition = insertion ? html.indexOf(insertion.after) : -1

  if (!insertion || markerPosition < 0) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  }

  const splitAt = markerPosition + insertion.after.length
  const Figure = insertion.Figure

  return (
    <>
      <div className={className} dangerouslySetInnerHTML={{ __html: html.slice(0, splitAt) }} />
      <Figure />
      <div className={className} dangerouslySetInnerHTML={{ __html: html.slice(splitAt) }} />
    </>
  )
}
