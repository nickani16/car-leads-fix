export {}

declare global {
  interface Window {
    __autorellHeaderAccount?: {
      authenticated?: boolean
      displayName?: string
      accountType?: string | null
      isAdmin?: boolean
      unreadMessages?: number
      conversationCount?: number
    }
  }
}
