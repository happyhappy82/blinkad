#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

/**
 * 블로그 포스트 SEO 자동 최적화 스크립트
 * - content에서 excerpt 자동 추출 (120-160자)
 * - imageUrl 자동 추가 (지역별 고품질 이미지)
 */

// HTML 태그 제거 함수
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')  // 모든 HTML 태그 제거
    .replace(/\s+/g, ' ')      // 연속된 공백을 하나로
    .trim()
}

// excerpt 생성 함수 (120-160자 최적화)
function generateExcerpt(content: string): string {
  const text = stripHtml(content)

  // 첫 문장이 너무 짧으면 두 번째 문장까지 포함
  const sentences = text.split(/[.!?]\s+/)
  let excerpt = ''

  for (const sentence of sentences) {
    if (excerpt.length + sentence.length < 160) {
      excerpt += sentence + '. '
    } else {
      break
    }
  }

  // 최소 120자 보장
  if (excerpt.length < 120) {
    excerpt = text.substring(0, 160)
  }

  return excerpt.trim().substring(0, 160)
}

// 지역별 imageUrl 매핑
const imageUrlMap: Record<string, string> = {
  // 제주도 관련 포스트
  'jeju-gujoaeub-gbp': 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1200&h=630&fit=crop',  // 제주 해안
  'jeju-nohyeongdong-gbp': 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1200&h=630&fit=crop',  // 제주 도시
  'gugeul-peulopil-i-pil-yohan-jejudo-nohyeongdong-sanggueon-teugjing-eun': 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1200&h=630&fit=crop',
  'jeju-dodudong-gbp': 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=1200&h=630&fit=crop',  // 제주 자연
  'dodudong-eseo-gbpi-jung-yohan-iyu': 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=1200&h=630&fit=crop',
  'jeju-bonggaedong-gbp': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=1200&h=630&fit=crop',  // 제주 풍경
  'jeju-bonggaedong-sajangnim-gugeul-peulopil-goanlineun-pilsuibnida': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=1200&h=630&fit=crop',
  'jeju-geon-ibdong-gbp': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=630&fit=crop',  // 제주 상점

  // 고운동(세종시) 관련 포스트
  'goundong-eseo-gbplan': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=630&fit=crop',  // 비즈니스 회의
  'goundong-gbp': 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop',  // Google 비즈니스
}

// constants/index.ts 파일 읽기
const constantsPath = path.join(process.cwd(), 'constants', 'index.ts')
let fileContent = fs.readFileSync(constantsPath, 'utf-8')

console.log('🔍 블로그 포스트 SEO 자동 최적화를 시작합니다...\n')

// 각 포스트별로 처리
let updatedCount = 0

// JSON 객체 패턴 찾기 (각 블로그 포스트)
const postPattern = /{[\s\S]*?"id":\s*"([^"]+)"[\s\S]*?"excerpt":\s*""[\s\S]*?"imageUrl":\s*""[\s\S]*?"content":\s*"([\s\S]*?)"\s*}/g

fileContent = fileContent.replace(postPattern, (match, id, content) => {
  // content는 이스케이프된 JSON 문자열이므로 파싱 필요
  let actualContent = ''
  try {
    actualContent = JSON.parse(`"${content}"`)
  } catch (e) {
    console.log(`⚠️  ${id}: content 파싱 실패, 원본 사용`)
    actualContent = content
  }

  // excerpt 생성
  const excerpt = generateExcerpt(actualContent)

  // imageUrl 선택
  const imageUrl = imageUrlMap[id] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'  // 기본 비즈니스 이미지

  console.log(`✅ ${id}`)
  console.log(`   Excerpt: ${excerpt.substring(0, 50)}...`)
  console.log(`   ImageUrl: ${imageUrl}\n`)

  updatedCount++

  // 매칭된 부분을 업데이트된 버전으로 교체
  return match
    .replace('"excerpt": ""', `"excerpt": ${JSON.stringify(excerpt)}`)
    .replace('"imageUrl": ""', `"imageUrl": ${JSON.stringify(imageUrl)}`)
})

// 파일 저장
fs.writeFileSync(constantsPath, fileContent, 'utf-8')

console.log(`\n🎉 총 ${updatedCount}개의 포스트가 최적화되었습니다!`)
console.log(`\n다음 단계: npm run validate:posts 를 실행하여 검증하세요.`)
