"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from "lucide-react"
import type { Collaborator } from "@/lib/collaboration-engine"

interface VideoChatProps {
  collaborators: Collaborator[]
}

export function VideoChat({ collaborators }: VideoChatProps) {
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>("")
  const [participantStates, setParticipantStates] = useState<Record<string, { video: boolean; audio: boolean }>>({})

  const videoRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (collaborators.length === 0) return

    const initialStates: Record<string, { video: boolean; audio: boolean }> = {}
    collaborators.forEach((c) => {
      initialStates[c.id] = { video: true, audio: true }
    })
    setParticipantStates(initialStates)

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomBot = collaborators[Math.floor(Math.random() * collaborators.length)]
        setParticipantStates((prev) => ({
          ...prev,
          [randomBot.id]: {
            video: Math.random() > 0.5,
            audio: Math.random() > 0.3,
          },
        }))
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [collaborators])

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [localStream, screenStream])

  const handleToggleVideo = async () => {
    try {
      if (!videoEnabled) {
        // Start video
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: audioEnabled,
        })

        setLocalStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setVideoEnabled(true)
        setError("")
      } else {
        // Stop video
        if (localStream) {
          localStream.getVideoTracks().forEach((track) => track.stop())
          if (!audioEnabled) {
            setLocalStream(null)
            if (videoRef.current) {
              videoRef.current.srcObject = null
            }
          }
        }
        setVideoEnabled(false)
      }
    } catch (err) {
      console.error("[v0] Error accessing camera:", err)
      setError("Camera access denied. Please allow camera permissions.")
    }
  }

  const handleToggleAudio = async () => {
    try {
      if (!audioEnabled) {
        // Start audio
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: true,
        })

        setLocalStream(stream)
        if (videoRef.current && videoEnabled) {
          videoRef.current.srcObject = stream
        }
        setAudioEnabled(true)
        setError("")
      } else {
        // Stop audio
        if (localStream) {
          localStream.getAudioTracks().forEach((track) => track.stop())
          if (!videoEnabled) {
            setLocalStream(null)
            if (videoRef.current) {
              videoRef.current.srcObject = null
            }
          }
        }
        setAudioEnabled(false)
      }
    } catch (err) {
      console.error("[v0] Error accessing microphone:", err)
      setError("Microphone access denied. Please allow microphone permissions.")
    }
  }

  const handleScreenShare = async () => {
    try {
      if (!screenSharing) {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        })

        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false)
          setScreenStream(null)
          if (screenRef.current) {
            screenRef.current.srcObject = null
          }
        }

        setScreenStream(stream)
        if (screenRef.current) {
          screenRef.current.srcObject = stream
        }
        setScreenSharing(true)
        setError("")
      } else {
        // Stop screen sharing
        if (screenStream) {
          screenStream.getTracks().forEach((track) => track.stop())
          setScreenStream(null)
          if (screenRef.current) {
            screenRef.current.srcObject = null
          }
        }
        setScreenSharing(false)
      }
    } catch (err) {
      console.error("[v0] Error accessing screen:", err)
      setError("Screen sharing cancelled or not supported.")
    }
  }

  const handleLeaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
      setScreenStream(null)
    }
    setVideoEnabled(false)
    setAudioEnabled(false)
    setScreenSharing(false)
    if (videoRef.current) videoRef.current.srcObject = null
    if (screenRef.current) screenRef.current.srcObject = null
  }

  return (
    <div className="flex h-full flex-col p-4">
      {error && (
        <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-auto">
        {/* Screen sharing view */}
        {screenSharing && (
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black border-2 border-green-500">
            <video ref={screenRef} autoPlay playsInline muted className="h-full w-full object-contain" />
            <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white flex items-center gap-1">
              <Monitor className="h-3 w-3 text-green-500" />
              Your Screen
            </div>
          </div>
        )}

        {/* Your video */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary border-2 border-accent">
          {videoEnabled && localStream ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
          ) : (
            <div className="flex h-full items-center justify-center">
              {videoEnabled ? (
                <div className="text-center">
                  <div className="animate-pulse text-muted-foreground">Starting camera...</div>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Camera Off</p>
                </div>
              )}
            </div>
          )}
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white flex items-center gap-2">
            <span>You (Host)</span>
            {audioEnabled ? <Mic className="h-3 w-3 text-green-500" /> : <MicOff className="h-3 w-3 text-red-500" />}
          </div>
        </div>

        {/* Collaborator videos */}
        {collaborators.map((participant) => {
          const state = participantStates[participant.id] || { video: true, audio: true }

          return (
            <div key={participant.id} className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
              <div className="flex h-full items-center justify-center">
                {state.video ? (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-white"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name[0]}
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Camera Off</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white flex items-center gap-2">
                <span>{participant.name}</span>
                {state.audio ? <Mic className="h-3 w-3 text-green-500" /> : <MicOff className="h-3 w-3 text-red-500" />}
              </div>
              <div className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                Active
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant={videoEnabled ? "default" : "outline"}
          size="sm"
          onClick={handleToggleVideo}
          title={videoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        <Button
          variant={audioEnabled ? "default" : "outline"}
          size="sm"
          onClick={handleToggleAudio}
          title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button
          variant={screenSharing ? "default" : "outline"}
          size="sm"
          onClick={handleScreenShare}
          title={screenSharing ? "Stop sharing" : "Share screen"}
        >
          {screenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </Button>
        <Button variant="destructive" size="sm" onClick={handleLeaveCall} title="Leave call">
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>

      {/* Status indicators */}
      <div className="mt-2 flex justify-center gap-4 text-xs">
        {videoEnabled && <span className="text-green-500">● Camera Active</span>}
        {audioEnabled && <span className="text-green-500">● Mic Active</span>}
        {screenSharing && <span className="text-green-500">● Screen Sharing</span>}
      </div>
    </div>
  )
}
