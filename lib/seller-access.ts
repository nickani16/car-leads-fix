import { createHash, randomBytes } from 'crypto'

export function createSellerAccessToken() {
  const token = randomBytes(32).toString('base64url')
  return {
    token,
    hash: hashSellerAccessToken(token),
  }
}

export function hashSellerAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
