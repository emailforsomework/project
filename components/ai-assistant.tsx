"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Sparkles, Send, Loader2 } from "lucide-react"

const SUGGESTIONS = [
  "Explain this code",
  "Find bugs",
  "Optimize performance",
  "Add comments",
  "Convert to TypeScript",
  "Write unit tests",
]

const AI_RESPONSES: Record<string, string> = {
  "explain this code":
    "This code implements the Fibonacci sequence using recursion. The function takes a number n and returns the nth Fibonacci number by recursively calling itself with n-1 and n-2. The base cases are when n is 0 or 1, which return n directly. The main loop then calculates and prints the first 10 Fibonacci numbers.",

  "find bugs":
    "I've analyzed the code and found a potential issue: The recursive Fibonacci implementation has exponential time complexity O(2^n), which can cause performance problems and stack overflow for large inputs (n > 40). Consider using memoization or an iterative approach for better performance.",

  "optimize performance":
    "To optimize this Fibonacci function, I recommend using memoization:\n\n```javascript\nconst memo = {};\nfunction fibonacci(n) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n-1) + fibonacci(n-2);\n  return memo[n];\n}\n```\n\nThis reduces time complexity from O(2^n) to O(n)!",

  "add comments":
    "I'll add detailed comments:\n\n```javascript\n// Recursive function to calculate Fibonacci number\n// @param {number} n - The position in sequence\n// @returns {number} The nth Fibonacci number\nfunction fibonacci(n) {\n  // Base cases: F(0)=0, F(1)=1\n  if (n <= 1) return n;\n  // Recursive case: F(n) = F(n-1) + F(n-2)\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n```",

  "convert to typescript":
    "Here's the TypeScript version:\n\n```typescript\nfunction fibonacci(n: number): number {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Usage with type safety\nfor (let i: number = 0; i < 10; i++) {\n  console.log(`F(${i}) = ${fibonacci(i)}`);\n}\n```",

  "write unit tests":
    "Here are comprehensive unit tests:\n\n```javascript\ndescribe('fibonacci', () => {\n  test('base cases', () => {\n    expect(fibonacci(0)).toBe(0);\n    expect(fibonacci(1)).toBe(1);\n  });\n  \n  test('small values', () => {\n    expect(fibonacci(5)).toBe(5);\n    expect(fibonacci(10)).toBe(55);\n  });\n});\n```",
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hi! I'm your AI coding assistant. I can help you understand code, find bugs, suggest improvements, and more. What would you like help with?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { role: "user", text }])
    setInput("")
    setLoading(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const lowerText = text.toLowerCase()
      let response = AI_RESPONSES[lowerText]

      if (!response) {
        // Generate contextual response for unknown queries
        if (lowerText.includes("help")) {
          response =
            "I can help you with code explanation, bug detection, performance optimization, adding comments, TypeScript conversion, and writing tests. Just ask!"
        } else if (lowerText.includes("error") || lowerText.includes("fix")) {
          response =
            "I'd be happy to help fix errors! Could you share the specific error message or describe what's not working as expected?"
        } else if (lowerText.includes("how")) {
          response =
            "I can explain how this code works! The current implementation uses recursion to calculate Fibonacci numbers. Would you like me to explain any specific part?"
        } else {
          response =
            "That's an interesting question! I can help you with code analysis, optimization, debugging, and more. Try clicking one of the suggestion buttons or ask me something specific about the code."
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", text: response }])
      setLoading(false)
    }, 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                <Sparkles className="h-4 w-4 animate-pulse text-accent-foreground" />
              </div>
              <div className="rounded-lg bg-secondary px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing code...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleSend(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            disabled={loading}
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
