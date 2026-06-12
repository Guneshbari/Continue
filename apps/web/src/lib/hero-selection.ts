import type { GameDetail } from '@continue/types'

/**
 * Calculates a visual impact score for a game to determine if it is a suitable candidate
 * for the homepage hero banner.
 *
 * Scoring formula factors:
 * 1. Average Rating (avgRating): Weight 3.0 (max 30 points)
 * 2. Rating Count (popularity): Logarithmic scale: log10(count + 1) * 2.5 (max 12.5 points)
 * 3. Backdrop availability: Having a backdrop image adds 15 points (critical for editorial split layout)
 * 4. Hero screenshot presence: Having screenshots, especially with high heroScore or designated primary candidates, adds up to 10 points
 * 5. Recency: Newer releases or upcoming/future dates score higher (up to 10 points)
 */
export function calculateHeroScore(game: GameDetail): number {
  // 1. Average Rating
  const avgRating = game.avgRating ?? 0
  const ratingScore = avgRating * 3.0

  // 2. Rating Count (logarithmic scale)
  const ratingCount = game.ratingCount ?? 0
  const ratingCountScore = Math.log10(ratingCount + 1) * 2.5

  // 3. Backdrop Presence
  const hasBackdrop = !!(game.backdrop?.rawUrl || game.bannerUrl)
  const backdropScore = hasBackdrop ? 15.0 : 0.0

  // 4. Hero Screenshot
  let screenshotScore = 0.0
  if (game.screenshots && game.screenshots.length > 0) {
    // If any screenshot is marked as primary hero, award full points
    const hasPrimaryHero = game.screenshots.some((s) => s.isPrimaryHeroCandidate)
    const maxHeroScore = game.screenshots.reduce((max, s) => Math.max(max, s.heroScore ?? 0), 0)

    if (hasPrimaryHero) {
      screenshotScore = 10.0
    } else if (maxHeroScore > 0) {
      screenshotScore = Math.min(10.0, maxHeroScore * 2.0)
    } else {
      screenshotScore = 5.0 // fallback points just for having screenshot gallery
    }
  }

  // 5. Recency
  let recencyScore = 0.0
  if (game.releaseDate) {
    const releaseTime = new Date(game.releaseDate).getTime()
    const now = Date.now()
    const yearsAgo = (now - releaseTime) / (365.25 * 24 * 60 * 60 * 1000)

    if (yearsAgo < 0) {
      // Future or upcoming release
      recencyScore = 10.0
    } else {
      // Scale: 0 years ago = 10, 1 year ago = 8, 5+ years ago = 0
      recencyScore = Math.max(0, 10 - yearsAgo * 2.0)
    }
  }

  return ratingScore + ratingCountScore + backdropScore + screenshotScore + recencyScore
}

/**
 * Iterates through candidates and returns the game with the highest visual score.
 */
export function selectHeroGame(games: GameDetail[]): GameDetail | null {
  if (games.length === 0) return null

  let bestGame = games[0]
  let bestScore = -1

  for (const game of games) {
    const score = calculateHeroScore(game)
    if (score > bestScore) {
      bestScore = score
      bestGame = game
    }
  }

  return bestGame ?? null
}
