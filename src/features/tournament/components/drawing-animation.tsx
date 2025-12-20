"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface Player {
  userId: string
  username: string
  imageUrl: string
  role: "ADMIN" | "USER"
}

interface Match {
  id: string
  round: number
  player1: Player
  player2: Player | null
  winner: Player | null
  status: "pending" | "bye"
}

interface DrawingAnimationProps {
  matches: Match[]
  onComplete: () => void
}

export function DrawingAnimation({ matches, onComplete }: DrawingAnimationProps) {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [revealedMatches, setRevealedMatches] = useState<Match[]>([])

  const revealMatch = useCallback(() => {
    if (currentMatchIndex >= matches.length) {
      // All matches revealed, wait 3 seconds then navigate to bracket
      setTimeout(() => {
        onComplete()
      }, 3000)
      return
    }

    // Start spinning animation
    setTimeout(() => {
      setIsSpinning(true)

      // After 3 seconds, reveal match (länger für mehr Spannung)
      setTimeout(() => {
        setIsSpinning(false)
        setRevealedMatches((prev) => [...prev, matches[currentMatchIndex]])

        // Move to next match after 1.5 seconds
        setTimeout(() => {
          setCurrentMatchIndex((prev) => prev + 1)
        }, 1500)
      }, 3000)
    }, 100)
  }, [currentMatchIndex, matches, onComplete])

  useEffect(() => {
    revealMatch()
  }, [revealMatch])

  const currentMatch = matches[currentMatchIndex]

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background p-8">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-4 text-foreground"
        >
          🎆 Turnier Auslosung
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground mb-12 text-lg"
        >
          Match {currentMatchIndex + 1} von {matches.length}
        </motion.p>

        {/* Slot Machine Animation */}
        {currentMatch && (
          <div className="bg-card/50 backdrop-blur border-2 border-primary/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-8">
              {/* Player 1 Slot */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-primary mb-4 relative">
                  <AnimatePresence mode="wait">
                    {isSpinning ? (
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="revealed"
                        initial={{ scale: 0, rotate: -360 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 1.2, bounce: 0.5 }}
                      >
                        <Image
                          src={currentMatch.player1.imageUrl}
                          alt={currentMatch.player1.username}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isSpinning ? 0 : 1 }}
                  className="text-xl font-bold text-foreground"
                >
                  {currentMatch.player1.username}
                </motion.p>
              </div>

              {/* VS Text */}
              <motion.div
                animate={{
                  scale: isSpinning ? [1, 1.2, 1] : 1,
                  rotate: isSpinning ? [0, 360] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isSpinning ? Infinity : 0,
                }}
                className="text-6xl font-bold text-primary"
              >
                VS
              </motion.div>

              {/* Player 2 Slot */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-primary mb-4 relative">
                  <AnimatePresence mode="wait">
                    {isSpinning ? (
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                      </motion.div>
                    ) : currentMatch.player2 ? (
                      <motion.div
                        key="revealed"
                        initial={{ scale: 0, rotate: 360 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 1.2, bounce: 0.5 }}
                      >
                        <Image
                          src={currentMatch.player2.imageUrl}
                          alt={currentMatch.player2.username}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="bye"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-4xl"
                      >
                        👻
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isSpinning ? 0 : 1 }}
                  className="text-xl font-bold text-foreground"
                >
                  {currentMatch.player2?.username || "BYE"}
                </motion.p>
              </div>
            </div>
          </div>
        )}

        {/* Revealed Matches List */}
        <div className="space-y-3">
          <AnimatePresence>
            {revealedMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card/30 backdrop-blur border border-primary/10 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={match.player1.imageUrl}
                      alt={match.player1.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold">{match.player1.username}</span>
                </div>

                <span className="text-primary font-bold">VS</span>

                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {match.player2?.username || "BYE"}
                  </span>
                  {match.player2 && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={match.player2.imageUrl}
                        alt={match.player2.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

