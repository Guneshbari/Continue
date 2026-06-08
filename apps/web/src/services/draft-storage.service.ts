interface ReviewDraft {
  title: string
  body: string
  status: 'PUBLISHED' | 'DRAFT'
  isSpoiler: boolean
}

class DraftStorageService {
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null
    try {
      // Prioritize sessionStorage for session isolation, fall back to localStorage
      return window.sessionStorage || window.localStorage
    } catch {
      return null
    }
  }

  saveDraft(gameId: string, draft: ReviewDraft): void {
    const storage = this.getStorage()
    if (!storage) return
    try {
      storage.setItem(`draft-review-${gameId}`, JSON.stringify(draft))
    } catch (e) {
      console.warn('[DraftStorage] Failed to save draft', e)
    }
  }

  getDraft(gameId: string): ReviewDraft | null {
    const storage = this.getStorage()
    if (!storage) return null
    try {
      const data = storage.getItem(`draft-review-${gameId}`)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  clearDraft(gameId: string): void {
    const storage = this.getStorage()
    if (!storage) return
    try {
      storage.removeItem(`draft-review-${gameId}`)
    } catch {
      // ignore
    }
  }
}

export const draftStorageService = new DraftStorageService()
export type { ReviewDraft }
