import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeNationalId, reviewNationalId } from '../lib/national-id.js'

test('national identifiers are normalized without storing presentation separators', () => {
  assert.equal(normalizeNationalId(' 84.12.25-123.45 '), '84122512345')
  assert.equal(normalizeNationalId('rssmra80a01h501u'), 'RSSMRA80A01H501U')
})

test('all eleven markets accept their supported official identifier shape', () => {
  const examples = [
    ['AT', 'PA1234567'],
    ['BE', '84.12.25-123.45'],
    ['DE', 'L01X00T47'],
    ['DK', '010190-1234'],
    ['ES', '12345678Z'],
    ['FI', '131052-308T'],
    ['FR', '1 84 12 75 056 789 01'],
    ['IT', 'RSSMRA80A01H501U'],
    ['NL', '123456782'],
    ['PL', '44051401359'],
    ['SE', '900101-0017'],
  ]

  for (const [country, value] of examples) {
    assert.notEqual(reviewNationalId(country, value).status, 'invalid', `${country}: ${value}`)
  }
})

test('deterministic checksum errors and malformed identifiers are rejected clearly', () => {
  assert.equal(reviewNationalId('ES', '12345678A').status, 'invalid')
  assert.equal(reviewNationalId('PL', '44051401358').status, 'invalid')
  assert.equal(reviewNationalId('DK', 'not-an-id').status, 'invalid')
  assert.equal(reviewNationalId('NL', '1234').status, 'invalid')
})

test('valid-looking documents that require external review do not block signup', () => {
  assert.equal(reviewNationalId('AT', 'PA1234567').status, 'needs_review')
  assert.equal(reviewNationalId('DE', 'L01X00T47').status, 'needs_review')
  assert.equal(reviewNationalId('DK', '010190-1234').status, 'needs_review')
  assert.equal(reviewNationalId('FR', '1 84 12 75 056 789 01').status, 'needs_review')
})
