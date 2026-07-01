export {}

declare global {
  interface Window {
    __autorellHeaderAccount?: {
      authenticated?: boolean
      displayName?: string
      accountType?: string | null
      unreadMessages?: number
      conversationCount?: number
    }
  }
}
