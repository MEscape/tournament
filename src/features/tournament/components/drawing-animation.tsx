"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Ghost, CheckCircle } from "lucide-react"

interface Player {
  userId: string
  username: string
  imageUrl: string
  role: "ADMIN" | "USER"
}

interface Match {
  id: string
  round: number
  matchNumber: number
  player1: Player | null
  player2: Player | null
  winner: Player | null
  status: "pending" | "completed" | "bye"
}

interface DrawingAnimationProps {
  matches: Match[]
  onComplete: () => void
}

export function DrawingAnimation({ matches, onComplete }: DrawingAnimationProps) {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [phase, setPhase] = useState<"intro" | "revealing" | "complete">("intro")
  const [revealedMatches, setRevealedMatches] = useState<Match[]>([])

  // Generate random particle positions once
  const [particles] = useState(() =>
    [...Array(20)].map(() => ({
      x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
      y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
      endY: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
  )

  const currentMatch = matches[currentMatchIndex]

  // Intro Phase
  useEffect(() => {
    if (phase === "intro") {
      const timer = setTimeout(() => {
        setPhase("revealing")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Revealing Phase
  const revealNextMatch = useCallback(() => {
    if (currentMatchIndex >= matches.length) {
      setPhase("complete")
      setTimeout(() => {
        onComplete()
      }, 2000)
      return
    }

    // Add match to revealed after 2 seconds
    setTimeout(() => {
      setRevealedMatches((prev) => [...prev, matches[currentMatchIndex]])

      // Move to next match
      setTimeout(() => {
        setCurrentMatchIndex((prev) => prev + 1)
      }, 1000)
    }, 2000)
  }, [currentMatchIndex, matches, onComplete])

  useEffect(() => {
    if (phase === "revealing") {
      revealNextMatch()
    }
  }, [phase, currentMatchIndex, revealNextMatch])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Animated Background */}
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

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              initial={{
                x: particle.x,
                y: particle.y,
                opacity: 0,
              }}
              animate={{
                y: [null, particle.endY],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-8">
        {/* Intro Phase */}
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="inline-block mb-6"
              >
                <Sparkles className="h-24 w-24 text-primary" />
              </motion.div>
              <h1 className="text-6xl font-bold text-foreground mb-4 flex items-center justify-center gap-4">
                <Sparkles className="h-16 w-16 text-primary" />
                Turnier Auslosung
                <Sparkles className="h-16 w-16 text-primary" />
              </h1>
              <p className="text-2xl text-muted-foreground">
                {matches.length} Matches werden ausgelost...
              </p>
            </motion.div>
          )}

          {/* Revealing Phase */}
          {phase === "revealing" && currentMatch && (
            <motion.div
              key={`match-${currentMatch.id}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold text-primary mb-2">
                  Match {currentMatchIndex + 1} von {matches.length}
                </h2>
              </motion.div>

              {/* Players Reveal */}
              <div className="flex items-center justify-center gap-12">
                {/* Player 1 */}
                {currentMatch.player1 ? (
                  <motion.div
                    initial={{ x: -200, opacity: 0, rotate: -180 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6, duration: 1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(255, 0, 0, 0.7)",
                            "0 0 0 20px rgba(255, 0, 0, 0)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary"
                      >
                        <Image
                          src={currentMatch.player1.imageUrl}
                          alt={currentMatch.player1.username}
                          width={160}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-2 -right-2 bg-primary rounded-full p-2"
                      >
                        <Zap className="h-6 w-6 text-white" />
                      </motion.div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-2xl font-bold mt-4 text-foreground"
                    >
                      {currentMatch.player1.username}
                    </motion.h3>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-40 h-40 rounded-full border-4 border-dashed border-muted flex items-center justify-center"
                  >
                    <Ghost className="h-20 w-20 text-muted-foreground" />
                  </motion.div>
                )}

                {/* VS */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.8, duration: 1, delay: 0.3 }}
                  className="text-7xl font-black text-primary"
                >
                  VS
                </motion.div>

                {/* Player 2 */}
                <motion.div
                  initial={{ x: 200, opacity: 0, rotate: 180 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, duration: 1 }}
                  className="flex flex-col items-center"
                >
                  {currentMatch.player2 ? (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <motion.div
                          animate={{
                            boxShadow: [
                              "0 0 0 0 rgba(255, 0, 0, 0.7)",
                              "0 0 0 20px rgba(255, 0, 0, 0)",
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.3,
                          }}
                          className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary"
                        >
                          <Image
                            src={currentMatch.player2.imageUrl}
                            alt={currentMatch.player2.username}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute -top-2 -left-2 bg-primary rounded-full p-2"
                        >
                          <Zap className="h-6 w-6 text-white" />
                        </motion.div>
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-2xl font-bold mt-4 text-foreground"
                      >
                        {currentMatch.player2.username}
                      </motion.h3>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-40 h-40 rounded-full border-4 border-dashed border-muted flex items-center justify-center"
                    >
                      <Ghost className="h-20 w-20 text-muted-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Complete Phase */}
          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="inline-block mb-6"
              >
                <Sparkles className="h-24 w-24 text-primary" />
              </motion.div>
              <h1 className="text-6xl font-bold text-foreground mb-4 flex items-center justify-center gap-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                Auslosung abgeschlossen!
              </h1>
              <p className="text-2xl text-muted-foreground">
                Weiterleitung zum Bracket...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revealed Matches Counter */}
        {phase === "revealing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex gap-2">
              {matches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: i < revealedMatches.length ? 1 : 0.5,
                    backgroundColor:
                      i < revealedMatches.length
                        ? "rgb(239, 68, 68)"
                        : "rgb(107, 114, 128)",
                  }}
                  className="w-3 h-3 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

