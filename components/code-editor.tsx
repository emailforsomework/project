"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Play, Download, Wand2, Loader2 } from "lucide-react"
import { executeJavaScript, executePython, executeTypeScript } from "@/lib/code-executor"
import { generateBotCollaborators, BotTypingSimulator, type Collaborator } from "@/lib/collaboration-engine"

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", ext: "js" },
  { value: "typescript", label: "TypeScript", ext: "ts" },
  { value: "python", label: "Python", ext: "py" },
]

const SAMPLE_CODE: Record<string, string> = {
  javascript: `// Welcome to CodeCollab!
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  python: `# Welcome to CodeCollab!
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print('Fibonacci sequence:')
for i in range(10):
    print(f'F({i}) = {fibonacci(i)}')`,
  typescript: `// Welcome to CodeCollab!
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
}

interface CursorPosition {
  userId: string
  line: number
  column: number
}

interface CodeEditorProps {
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void
}

export function CodeEditor({ onCollaboratorsChange }: CodeEditorProps) {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(SAMPLE_CODE.javascript)
  const [output, setOutput] = useState<string>("Ready to execute code...")
  const [isRunning, setIsRunning] = useState(false)
  const [cursors, setCursors] = useState<CursorPosition[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const botSimulatorRef = useRef<BotTypingSimulator | null>(null)

  useEffect(() => {
    const bots = generateBotCollaborators(3)
    setCollaborators(bots)
    onCollaboratorsChange?.(bots)

    // Start bot typing simulation
    const simulator = new BotTypingSimulator(
      bots,
      code,
      (userId, line, column) => {
        setCursors((prev) => {
          const filtered = prev.filter((c) => c.userId !== userId)
          return [...filtered, { userId, line, column }]
        })
      },
      (newCode, userId) => {
        console.log(`[v0] Bot ${userId} made an edit`)
        setCode(newCode)
      },
    )

    simulator.start()
    botSimulatorRef.current = simulator

    return () => {
      simulator.stop()
    }
  }, [])

  // Update simulator when code changes
  useEffect(() => {
    botSimulatorRef.current?.updateCode(code)
  }, [code])

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    setCode(SAMPLE_CODE[value] || SAMPLE_CODE.javascript)
    setOutput("Ready to execute code...")
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setOutput("Executing...")

    try {
      let result

      if (language === "javascript") {
        result = await executeJavaScript(code)
      } else if (language === "python") {
        result = await executePython(code)
      } else if (language === "typescript") {
        result = await executeTypeScript(code)
      } else {
        result = {
          output: "",
          error: `Execution not supported for ${language}`,
          executionTime: 0,
        }
      }

      const outputText = [
        result.output,
        result.error ? `\n❌ ${result.error}` : "",
        `\n⏱️  Execution time: ${result.executionTime.toFixed(2)}ms`,
      ]
        .filter(Boolean)
        .join("\n")

      setOutput(outputText)
    } catch (error: any) {
      setOutput(`❌ Execution failed: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleFormat = () => {
    const formatted = code
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
    setCode(formatted)
  }

  const handleDownload = () => {
    const lang = LANGUAGES.find((l) => l.value === language)
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${lang?.ext || "txt"}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border" />

          <Button variant="ghost" size="sm" onClick={handleFormat}>
            <Wand2 className="mr-2 h-4 w-4" />
            Format
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Cursors Indicator */}
          <div className="flex -space-x-2">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-xs font-medium text-white"
                style={{ backgroundColor: collab.color }}
                title={collab.name}
              >
                {collab.name[0]}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{collaborators.length} editing</span>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex">
          {/* Line Numbers */}
          <div className="w-12 select-none bg-secondary/30 py-4 text-right font-mono text-sm text-muted-foreground">
            {code.split("\n").map((_, i) => (
              <div key={i} className="px-2 leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none"
              spellCheck={false}
              style={{
                tabSize: 2,
              }}
            />

            {cursors.map((cursor) => {
              const collab = collaborators.find((c) => c.id === cursor.userId)
              if (!collab) return null

              return (
                <div
                  key={cursor.userId}
                  className="pointer-events-none absolute transition-all duration-300"
                  style={{
                    top: `${cursor.line * 24 + 16}px`,
                    left: `${cursor.column * 8.4 + 16}px`,
                  }}
                >
                  <div className="h-5 w-0.5 animate-pulse" style={{ backgroundColor: collab.color }} />
                  <div
                    className="mt-1 rounded px-1.5 py-0.5 text-xs font-medium text-white whitespace-nowrap"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.name}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-sm font-medium">Output</span>
          <Button variant="ghost" size="sm" onClick={handleRunCode} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </div>
        <div className="h-32 overflow-auto p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap text-foreground">{output}</pre>
        </div>
      </div>
    </div>
  )
}
