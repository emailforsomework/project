"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { TerminalIcon, X } from "lucide-react"
import { Button } from "./ui/button"

const FILE_SYSTEM = {
  "/workspace/project": {
    "main.js": 'console.log("Hello World");',
    "utils.js": "export const add = (a, b) => a + b;",
    "package.json": '{"name": "project", "version": "1.0.0"}',
    "README.md": "# My Project\n\nA collaborative coding project.",
    src: {
      "index.js": 'import { add } from "./utils";\nconsole.log(add(2, 3));',
      components: {
        "Button.jsx": "export const Button = () => <button>Click me</button>;",
      },
    },
  },
}

export function Terminal() {
  const [history, setHistory] = useState<Array<{ type: "input" | "output" | "error"; text: string }>>([
    { type: "output", text: "Welcome to CodeCollab Terminal v1.0.0" },
    { type: "output", text: 'Type "help" for available commands' },
    { type: "output", text: "" },
  ])
  const [input, setInput] = useState("")
  const [currentPath, setCurrentPath] = useState("/workspace/project")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  const executeCommand = (cmd: string) => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0]?.toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case "help":
        return `Available commands:
  help              Show this help message
  clear             Clear terminal
  ls [path]         List directory contents
  cd <path>         Change directory
  pwd               Print working directory
  cat <file>        Display file contents
  echo <text>       Print text to terminal
  whoami            Display current user
  date              Show current date and time
  mkdir <dir>       Create directory (simulated)
  touch <file>      Create file (simulated)
  rm <file>         Remove file (simulated)
  node <file>       Run JavaScript file
  python <file>     Run Python file
  git status        Show git status (simulated)
  npm install       Install dependencies (simulated)`

      case "clear":
        setHistory([])
        return null

      case "ls":
        const lsPath = args[0] || currentPath
        return `main.js  utils.js  package.json  README.md  src/`

      case "cd":
        if (!args[0]) return "cd: missing operand"
        if (args[0] === "..") {
          const parts = currentPath.split("/").filter(Boolean)
          parts.pop()
          setCurrentPath("/" + parts.join("/"))
          return null
        }
        setCurrentPath(currentPath + "/" + args[0])
        return null

      case "pwd":
        return currentPath

      case "cat":
        if (!args[0]) return "cat: missing file operand"
        return `// Content of ${args[0]}
console.log("Hello from ${args[0]}");
// This is a simulated file`

      case "echo":
        return args.join(" ")

      case "whoami":
        return "developer"

      case "date":
        return new Date().toString()

      case "mkdir":
        if (!args[0]) return "mkdir: missing operand"
        return `Directory created: ${args[0]}`

      case "touch":
        if (!args[0]) return "touch: missing file operand"
        return `File created: ${args[0]}`

      case "rm":
        if (!args[0]) return "rm: missing operand"
        return `Removed: ${args[0]}`

      case "node":
        if (!args[0]) return "node: missing file operand"
        return `Executing ${args[0]}...
Hello World
Process exited with code 0`

      case "python":
        if (!args[0]) return "python: missing file operand"
        return `Python 3.11.0
Executing ${args[0]}...
Hello from Python!`

      case "git":
        if (args[0] === "status") {
          return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   main.js
  modified:   utils.js

no changes added to commit`
        }
        return `git: '${args.join(" ")}' is not a git command`

      case "npm":
        if (args[0] === "install") {
          return `Installing dependencies...
added 234 packages in 3.2s`
        }
        return `npm: '${args.join(" ")}' is not a npm command`

      default:
        return `Command not found: ${command}. Type 'help' for available commands.`
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const trimmed = input.trim()
    setHistory((prev) => [...prev, { type: "input", text: `${currentPath} $ ${trimmed}` }])

    const output = executeCommand(trimmed)

    if (output !== null) {
      setHistory((prev) => [...prev, { type: "output", text: output }])
    }

    setInput("")
  }

  const handleClear = () => {
    setHistory([
      { type: "output", text: "Terminal cleared" },
      { type: "output", text: "" },
    ])
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm" onClick={() => inputRef.current?.focus()}>
        {history.map((entry, i) => (
          <div
            key={i}
            className={
              entry.type === "input"
                ? "text-accent font-semibold"
                : entry.type === "error"
                  ? "text-red-400"
                  : "whitespace-pre-wrap text-foreground"
            }
          >
            {entry.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-accent font-semibold">{currentPath} $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent font-mono outline-none"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  )
}
