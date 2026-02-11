#!/usr/bin/env tsx

import { BLOG_POSTS } from '../constants'
import { validateAllPosts, printValidationResults } from '../constants/validation'

/**
 * 블로그 포스트 SEO 검증 스크립트
 *
 * 사용법:
 *   npm run validate:posts
 *
 * 또는:
 *   npx tsx scripts/validate-posts.ts
 */

console.log('🔍 블로그 포스트 SEO 검증을 시작합니다...\n')
console.log(`총 ${BLOG_POSTS.length}개의 포스트를 검증합니다.\n`)

const results = validateAllPosts(BLOG_POSTS)
printValidationResults(results)

// 에러가 있는 포스트 확인
const hasErrors = Array.from(results.values()).some(r => !r.isValid)

if (hasErrors) {
  console.log('\n⚠️  에러가 있는 포스트가 있습니다. 수정이 필요합니다.')
  // 빌드는 계속 진행 (warning only)
  process.exit(0)
} else {
  console.log('\n✅ 모든 포스트가 검증을 통과했습니다!')
  process.exit(0)
}
