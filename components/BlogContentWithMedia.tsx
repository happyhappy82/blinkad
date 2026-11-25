import BlogInquiryGapFigure from './BlogInquiryGapFigure'
import BlogLanguageSwitchFigure from './BlogLanguageSwitchFigure'
import BlogClinicNavigationFigure from './BlogClinicNavigationFigure'

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
  {
    postId: 'hospital-website-content-structure',
    after: '<p>제작사에는 페이지별 목적, 들어갈 항목, 병원 측 확인 담당자를 정리한 구성표를 요청하세요. 주요 안내는 각각 공유할 수 있는 고유 주소를 두고, 첫 화면을 거치지 않고 해당 주소로 들어와도 병원명과 안내 주제를 알 수 있게 구성합니다.</p>',
    Figure: BlogClinicNavigationFigure,
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
