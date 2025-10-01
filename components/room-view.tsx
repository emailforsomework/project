"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Copy,
  Check,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  name: string
  videoEnabled: boolean
  audioEnabled: boolean
  isScreenSharing: boolean
  stream?: MediaStream
}

interface Message {
  id: string
  sender: string
  text: string
  timestamp: Date
}

export default function RoomView({ roomId }: { roomId: string }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)

  // Initialize local media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        })
        setLocalStream(stream)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Add current user as participant
        setParticipants([
          {
            id: "local",
            name: "You",
            videoEnabled: true,
            audioEnabled: true,
            isScreenSharing: false,
            stream,
          },
        ])

        // Simulate other participants joining
        setTimeout(() => addSimulatedParticipant("Alice"), 2000)
        setTimeout(() => addSimulatedParticipant("Bob"), 4000)
        setTimeout(() => addSimulatedParticipant("Charlie"), 6000)
      } catch (error) {
        console.error("[v0] Error accessing media devices:", error)
      }
    }

    initMedia()

    return () => {
      localStream?.getTracks().forEach((track) => track.stop())
      screenStream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const addSimulatedParticipant = async (name: string) => {
    try {
      // Create a simulated video stream for demo participants
      const canvas = document.createElement("canvas")
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext("2d")

      // Draw a colored background with participant name
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      const drawFrame = () => {
        if (ctx) {
          ctx.fillStyle = color
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = "white"
          ctx.font = "48px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(name, canvas.width / 2, canvas.height / 2)
        }
      }

      drawFrame()
      setInterval(drawFrame, 1000)

      const stream = canvas.captureStream(30)

      setParticipants((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          name,
          videoEnabled: true,
          audioEnabled: true,
          isScreenSharing: false,
          stream,
        },
      ])

      // Simulate participant sending a message
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            sender: name,
            text: `Hi everyone! I just joined the room.`,
            timestamp: new Date(),
          },
        ])
      }, 1000)
    } catch (error) {
      console.error("[v0] Error creating simulated participant:", error)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)

        setParticipants((prev) => prev.map((p) => (p.id === "local" ? { ...p, videoEnabled: videoTrack.enabled } : p)))
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)

        setParticipants((prev) => prev.map((p) => (p.id === "local" ? { ...p, audioEnabled: audioTrack.enabled } : p)))
      }
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach((track) => track.stop())
      setScreenStream(null)
      setIsScreenSharing(false)

      setParticipants((prev) => prev.map((p) => (p.id === "local" ? { ...p, isScreenSharing: false } : p)))
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: false,
        })

        setScreenStream(stream)
        setIsScreenSharing(true)

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
        }

        setParticipants((prev) => prev.map((p) => (p.id === "local" ? { ...p, isScreenSharing: true } : p)))

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null)
          setIsScreenSharing(false)
          setParticipants((prev) => prev.map((p) => (p.id === "local" ? { ...p, isScreenSharing: false } : p)))
        }
      } catch (error) {
        console.error("[v0] Error sharing screen:", error)
      }
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendMessage = () => {
    if (message.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: "You",
          text: message,
          timestamp: new Date(),
        },
      ])
      setMessage("")

      // Simulate responses from other participants
      setTimeout(() => {
        const responders = participants.filter((p) => p.id !== "local")
        if (responders.length > 0) {
          const responder = responders[Math.floor(Math.random() * responders.length)]
          const responses = [
            "That's a great point!",
            "I agree with that.",
            "Thanks for sharing!",
            "Interesting perspective.",
            "Let me think about that.",
          ]
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(7),
              sender: responder.name,
              text: responses[Math.floor(Math.random() * responses.length)],
              timestamp: new Date(),
            },
          ])
        }
      }, 2000)
    }
  }

  const leaveRoom = () => {
    localStream?.getTracks().forEach((track) => track.stop())
    screenStream?.getTracks().forEach((track) => track.stop())
    window.location.href = "/"
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-semibold">Room: {roomId}</h1>
            <p className="text-xs text-muted-foreground">{participants.length} participants</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyRoomId} className="gap-2 bg-transparent">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Room ID"}
          </Button>
          <Button variant="destructive" size="sm" onClick={leaveRoom} className="gap-2">
            <Phone className="w-4 h-4" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div
            className={cn(
              "grid gap-4 h-full",
              participants.length === 1 && "grid-cols-1",
              participants.length === 2 && "grid-cols-2",
              participants.length === 3 && "grid-cols-2",
              participants.length >= 4 && "grid-cols-2 lg:grid-cols-3",
            )}
          >
            {/* Screen Share (if active) */}
            {isScreenSharing && screenStream && (
              <Card className="relative aspect-video bg-black overflow-hidden col-span-full">
                <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Your Screen</span>
                </div>
              </Card>
            )}

            {/* Participants */}
            {participants.map((participant) => (
              <Card key={participant.id} className="relative aspect-video bg-black overflow-hidden">
                {participant.stream && participant.videoEnabled ? (
                  <video
                    autoPlay
                    playsInline
                    muted={participant.id === "local"}
                    ref={participant.id === "local" ? localVideoRef : undefined}
                    srcObject={participant.stream}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {participant.name[0]}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>{participant.name}</span>
                  {!participant.audioEnabled && <MicOff className="w-3 h-3 text-destructive" />}
                  {participant.isScreenSharing && <Monitor className="w-3 h-3 text-primary" />}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <Card className="w-80 border-l rounded-none flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                ✕
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm bg-muted p-2 rounded">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </Card>
        )}

        {/* Participants Sidebar */}
        {showParticipants && (
          <Card className="w-64 border-l rounded-none flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({participants.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowParticipants(false)}>
                ✕
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {participant.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {participant.videoEnabled ? (
                      <Video className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <VideoOff className="w-4 h-4 text-destructive" />
                    )}
                    {participant.audioEnabled ? (
                      <Mic className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <MicOff className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="border-t bg-card px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <Button variant={videoEnabled ? "default" : "destructive"} size="lg" onClick={toggleVideo} className="gap-2">
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button variant={audioEnabled ? "default" : "destructive"} size="lg" onClick={toggleAudio} className="gap-2">
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="gap-2"
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <div className="w-px h-8 bg-border mx-2" />

          <Button
            variant={showChat ? "default" : "outline"}
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="gap-2"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant={showParticipants ? "default" : "outline"}
            size="lg"
            onClick={() => setShowParticipants(!showParticipants)}
            className="gap-2"
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
