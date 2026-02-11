import { BlogPost } from './types'

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  score: number
}

/**
 * 블로그 포스트 SEO 검증
 *
 * 필수 규칙:
 * 1. excerpt: 최소 50자 이상 (description 자동 확장 방지)
 * 2. imageUrl: 필수 (소셜 공유 썸네일)
 * 3. title: 10~60자 (SEO 최적)
 * 4. id: slug 형식 (소문자, 하이픈)
 *
 * 권장 사항:
 * 1. excerpt: 120~160자 (Google description 최적)
 * 2. title: 30~50자 (클릭율 최적)
 * 3. content: 최소 300자 이상
 * 4. H2 태그 포함
 */
export function validateBlogPost(post: BlogPost): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let score = 100

  // 1. Title 검증
  if (!post.title || post.title.length < 10) {
    errors.push({
      field: 'title',
      message: '제목은 최소 10자 이상이어야 합니다',
      severity: 'error'
    })
    score -= 20
  } else if (post.title.length > 60) {
    warnings.push({
      field: 'title',
      message: '제목이 60자를 초과합니다 (검색 결과에서 잘릴 수 있음)',
      severity: 'warning'
    })
    score -= 5
  } else if (post.title.length < 30) {
    warnings.push({
      field: 'title',
      message: '제목이 30자 미만입니다 (30~50자 권장)',
      severity: 'warning'
    })
    score -= 3
  }

  // 2. Excerpt 검증 (중요!)
  if (!post.excerpt || post.excerpt.length < 50) {
    errors.push({
      field: 'excerpt',
      message: 'excerpt는 최소 50자 이상이어야 합니다 (자동 확장 방지)',
      severity: 'error'
    })
    score -= 30
  } else if (post.excerpt.length < 120) {
    warnings.push({
      field: 'excerpt',
      message: 'excerpt는 120~160자가 가장 이상적입니다',
      severity: 'warning'
    })
    score -= 5
  } else if (post.excerpt.length > 160) {
    warnings.push({
      field: 'excerpt',
      message: 'excerpt가 160자를 초과합니다 (검색 결과에서 잘릴 수 있음)',
      severity: 'warning'
    })
    score -= 5
  }

  // 3. ImageUrl 검증 (필수!)
  if (!post.imageUrl) {
    errors.push({
      field: 'imageUrl',
      message: 'imageUrl은 필수입니다 (소셜 공유 썸네일)',
      severity: 'error'
    })
    score -= 20
  }

  // 4. ID (slug) 검증
  const slugPattern = /^[a-z0-9-]+$/
  if (!post.id || !slugPattern.test(post.id)) {
    errors.push({
      field: 'id',
      message: 'id는 소문자, 숫자, 하이픈만 사용해야 합니다',
      severity: 'error'
    })
    score -= 15
  }

  // 5. Category 검증
  if (!post.category) {
    warnings.push({
      field: 'category',
      message: 'category가 설정되지 않았습니다',
      severity: 'warning'
    })
    score -= 5
  }

  // 6. Content 검증
  if (!post.content || post.content.length < 300) {
    warnings.push({
      field: 'content',
      message: 'content가 너무 짧습니다 (최소 300자 권장)',
      severity: 'warning'
    })
    score -= 10
  }

  // H2 태그 확인
  if (post.content && !post.content.includes('<h2>')) {
    warnings.push({
      field: 'content',
      message: 'H2 태그가 없습니다 (구조화된 콘텐츠 권장)',
      severity: 'warning'
    })
    score -= 5
  }

  // 7. Date 형식 검증
  const datePattern = /^\d{4}\.\d{2}\.\d{2}$/
  if (!post.date || !datePattern.test(post.date)) {
    errors.push({
      field: 'date',
      message: 'date는 YYYY.MM.DD 형식이어야 합니다',
      severity: 'error'
    })
    score -= 10
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  }
}

/**
 * 전체 블로그 포스트 검증
 */
export function validateAllPosts(posts: BlogPost[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>()

  posts.forEach(post => {
    results.set(post.id, validateBlogPost(post))
  })

  return results
}

/**
 * 검증 결과 출력 (개발용)
 */
export function printValidationResults(results: Map<string, ValidationResult>): void {
  console.log('\n=== 블로그 포스트 SEO 검증 결과 ===\n')

  let totalScore = 0
  let validCount = 0

  results.forEach((result, postId) => {
    totalScore += result.score
    if (result.isValid) validCount++

    const emoji = result.score >= 90 ? '✅' : result.score >= 70 ? '⚠️' : '❌'
    console.log(`${emoji} ${postId}: ${result.score}점`)

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`   ❌ ${error.field}: ${error.message}`)
      })
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning.field}: ${warning.message}`)
      })
    }

    console.log()
  })

  const avgScore = totalScore / results.size
  console.log(`\n평균 점수: ${avgScore.toFixed(1)}점`)
  console.log(`완벽한 글: ${validCount}/${results.size}`)
  console.log(`\n90점 이상: SEO 최적화 완료`)
  console.log(`70~89점: 개선 필요`)
  console.log(`70점 미만: 심각한 문제`)
}
