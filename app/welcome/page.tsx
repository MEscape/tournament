import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-card border-border">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to Tournament
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our exclusive community with an access code
          </p>

          <div className="pt-8 space-y-4">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
              >
                Register Now
              </Button>
            </Link>

            <Link href="/admin">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg py-6"
              >
                Admin Login
              </Button>
            </Link>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              You need a valid access code to register. <br />
              Contact an administrator to get your code.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

