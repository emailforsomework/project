"use client"

import { Users, Crown, Circle } from "lucide-react"
import type { Collaborator } from "@/lib/collaboration-engine"

interface ParticipantsListProps {
  collaborators: Collaborator[]
}

export function ParticipantsList({ collaborators }: ParticipantsListProps) {
  const allParticipants = [
    { id: "you", name: "You", status: "online", isHost: true, color: "#6366f1" },
    ...collaborators.map((c) => ({
      id: c.id,
      name: c.name,
      status: "online" as const,
      isHost: false,
      color: c.color,
    })),
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Participants</h2>
        <span className="ml-auto text-xs text-muted-foreground">{allParticipants.length} online</span>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {allParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary"
            >
              <div className="relative">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name[0]}
                </div>
                <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card fill-green-500 text-green-500" />
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-medium">{participant.name}</span>
                  {participant.isHost && <Crown className="h-3 w-3 shrink-0 text-yellow-500" />}
                </div>
                <span className="text-xs text-muted-foreground capitalize">{participant.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-secondary p-3 text-xs">
          <p className="font-medium text-foreground mb-1">Active Session</p>
          <p className="text-muted-foreground">
            {allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""} coding together
          </p>
        </div>
      </div>
    </div>
  )
}
