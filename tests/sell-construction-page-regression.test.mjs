import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const sellPage = readFileSync(new URL('../app/components/WhyChooseAutorellPage.tsx', import.meta.url), 'utf8')
const constructionCopy = readFileSync(new URL('../app/components/ConstructionBenefitsCopy.ts', import.meta.url), 'utf8')

test('sell construction page uses refreshed step images', () => {
  assert.match(sellPage, /sell-construction-step-create-v3\.png/)
  assert.match(sellPage, /sell-construction-step-photo-v3\.png/)
  assert.match(sellPage, /sell-construction-step-contact-v3\.png/)
  assert.doesNotMatch(sellPage, /sell-construction-step-create-v2\.png/)
  assert.doesNotMatch(sellPage, /sell-construction-step-photo-v2\.png/)
  assert.doesNotMatch(sellPage, /sell-construction-step-contact-v2\.png/)
})

test('sell construction blue section is straight and readable', () => {
  assert.match(sellPage, /<section className="relative overflow-hidden bg-\[#0866ff\] py-14 text-white sm:py-20">/)
  assert.match(sellPage, /lg:grid-cols-2 lg:items-center lg:gap-16/)
  assert.doesNotMatch(sellPage, /clipPath:\s*'polygon/)
})

test('sell construction seo copy says machines without the repeated construction wording', () => {
  assert.match(constructionCopy, /SÄLJ MASKINER PÅ AUTORELL/)
  assert.match(constructionCopy, /Sälj maskiner gratis/)
  assert.match(constructionCopy, /Byggd för att maskiner ska hittas/)
  assert.match(constructionCopy, /andra maskiner med rätt tekniska data och bilder/)
  assert.doesNotMatch(constructionCopy, /SÄLJ ENTREPRENADSMASKINER PÅ AUTORELL/)
  assert.doesNotMatch(constructionCopy, /title: 'Sälj entreprenadmaskiner gratis'/)
  assert.doesNotMatch(constructionCopy, /Byggd för att entreprenadmaskiner ska hittas/)
  assert.doesNotMatch(constructionCopy, /annan entreprenadutrustning med rätt tekniska data och bilder/)
})
