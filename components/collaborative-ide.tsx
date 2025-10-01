"use client"

import { useState } from "react"
import { CodeEditor } from "./code-editor"
import { Terminal } from "./terminal"
import { ChatPanel } from "./chat-panel"
import { VideoChat } from "./video-chat"
import { Whiteboard } from "./whiteboard"
import { AIAssistant } from "./ai-assistant"
import { ParticipantsList } from "./participants-list"
import { Button } from "./ui/button"
import { Code2, TerminalIcon, MessageSquare, Video, Palette, Sparkles, Users, Share2, Check } from "lucide-react"
import type { Collaborator } from "@/lib/collaboration-engine"

export default function CollaborativeIDE() {
  const [activePanel, setActivePanel] = useState<"terminal" | "chat" | "video" | "whiteboard" | "ai">("terminal")
  const [showParticipants, setShowParticipants] = useState(true)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const roomUrl = window.location.href
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-accent" />
            <h1 className="text-lg font-semibold">CodeCollab</h1>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Room: {Math.random().toString(36).substring(2, 11)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share Room
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
            <Users className="mr-2 h-4 w-4" />
            {showParticipants ? "Hide" : "Show"} Participants ({collaborators.length})
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Participants */}
        {showParticipants && (
          <aside className="w-64 border-r border-border bg-card">
            <ParticipantsList collaborators={collaborators} />
          </aside>
        )}

        {/* Center - Code Editor */}
        <main className="flex flex-1 flex-col">
          <CodeEditor onCollaboratorsChange={setCollaborators} />
        </main>

        {/* Right Sidebar - Tools */}
        <aside className="flex w-96 flex-col border-l border-border bg-card">
          {/* Tool Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActivePanel("terminal")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activePanel === "terminal"
                  ? "border-b-2 border-accent bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <TerminalIcon className="h-4 w-4" />
              Terminal
            </button>
            <button
              onClick={() => setActivePanel("chat")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activePanel === "chat"
                  ? "border-b-2 border-accent bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </button>
            <button
              onClick={() => setActivePanel("video")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activePanel === "video"
                  ? "border-b-2 border-accent bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Video className="h-4 w-4" />
              Video
            </button>
            <button
              onClick={() => setActivePanel("whiteboard")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activePanel === "whiteboard"
                  ? "border-b-2 border-accent bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Palette className="h-4 w-4" />
              Board
            </button>
            <button
              onClick={() => setActivePanel("ai")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activePanel === "ai"
                  ? "border-b-2 border-accent bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </button>
          </div>

          {/* Tool Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === "terminal" && <Terminal />}
            {activePanel === "chat" && <ChatPanel collaborators={collaborators} />}
            {activePanel === "video" && <VideoChat collaborators={collaborators} />}
            {activePanel === "whiteboard" && <Whiteboard />}
            {activePanel === "ai" && <AIAssistant />}
          </div>
        </aside>
      </div>
    </div>
  )
}
