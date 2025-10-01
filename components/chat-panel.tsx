"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Send } from "lucide-react"
import type { Collaborator } from "@/lib/collaboration-engine"

interface ChatPanelProps {
  collaborators: Collaborator[]
}

interface Message {
  id: string
  userId: string
  userName: string
  text: string
  time: string
}

const BOT_MESSAGES = [
  "This looks great!",
  "I'm working on the function now",
  "Should we optimize this part?",
  "Good idea with the recursion",
  "Let me test this real quick",
  "The output looks correct",
  "Maybe we should add error handling?",
  "I'll work on the documentation",
  "Nice work everyone!",
  "This is coming together nicely",
]

export function ChatPanel({ collaborators }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      userId: "system",
      userName: "System",
      text: "Welcome to the chat! Collaborate with your team here.",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (collaborators.length === 0) return

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        // 40% chance every interval
        const randomBot = collaborators[Math.floor(Math.random() * collaborators.length)]
        const randomMessage = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)]

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            userId: randomBot.id,
            userName: randomBot.name,
            text: randomMessage,
            time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          },
        ])
      }
    }, 8000) // Check every 8 seconds

    return () => clearInterval(interval)
  }, [collaborators])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: "you",
          userName: "You",
          text: input,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ])
      setInput("")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const collaborator = collaborators.find((c) => c.id === msg.userId)
            const isYou = msg.userId === "you"
            const isSystem = msg.userId === "system"

            return (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {!isSystem && collaborator && (
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: collaborator.color }} />
                  )}
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isYou ? "#3b82f6" : collaborator?.color || "#888" }}
                  >
                    {msg.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-sm text-foreground pl-4">{msg.text}</p>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
