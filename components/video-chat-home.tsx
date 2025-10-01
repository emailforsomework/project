"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Video, Users, MessageSquare, Monitor } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VideoChat() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  const startNewRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10)
    router.push(`/room/${newRoomId}`)
  }

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 md:p-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Video className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Video Chat Room</h1>
          <p className="text-muted-foreground text-lg">
            Connect with anyone, anywhere with real-time video, audio, and screen sharing
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Video className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">HD Video</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Live Chat</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Monitor className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Screen Share</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Button onClick={startNewRoom} size="lg" className="w-full text-lg h-14">
              <Users className="w-5 h-5 mr-2" />
              Start New Room
            </Button>
            <p className="text-xs text-center text-muted-foreground">Create a new room and invite others to join</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                className="h-14 text-lg"
              />
              <Button
                onClick={joinRoom}
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent"
                disabled={!roomId.trim()}
              >
                Join
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">Enter a room ID to join an existing session</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
