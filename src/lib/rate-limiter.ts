// Simple In-Memory Rate Limiter
// Für Polling API Protection

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  check(userId: string, config: RateLimitConfig = { maxRequests: 30, windowMs: 60000 }): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []

    // Remove expired requests (outside time window)
    const validRequests = userRequests.filter(time => now - time < config.windowMs)

    // Check if limit exceeded
    if (validRequests.length >= config.maxRequests) {
      return false // Rate limit exceeded
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(userId, validRequests)

    return true // Request allowed
  }

  // Cleanup old entries (call periodically)
  cleanup(maxAge: number = 120000): void {
    const now = Date.now()
    for (const [userId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge)
      if (validRequests.length === 0) {
        this.requests.delete(userId)
      } else {
        this.requests.set(userId, validRequests)
      }
    }
  }
}

// Singleton
export const rateLimiter = new RateLimiter()

// Auto-cleanup every 2 minutes
if (typeof window === "undefined") {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 120000)
}

