export interface Collaborator {
  id: string
  name: string
  color: string
  isBot: boolean
}

export interface CursorPosition {
  line: number
  column: number
  userId: string
}

export interface CodeEdit {
  position: number
  text: string
  userId: string
}

const BOT_NAMES = ["Alice", "Bob", "Charlie", "Diana"]
const BOT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

// Generate bot collaborators
export function generateBotCollaborators(count = 3): Collaborator[] {
  return Array.from({ length: Math.min(count, BOT_NAMES.length) }, (_, i) => ({
    id: `bot-${i}`,
    name: BOT_NAMES[i],
    color: BOT_COLORS[i],
    isBot: true,
  }))
}

// Simulate bot typing
export class BotTypingSimulator {
  private bots: Collaborator[]
  private code: string
  private onCursorMove: (userId: string, line: number, column: number) => void
  private onCodeChange: (newCode: string, userId: string) => void
  private intervals: NodeJS.Timeout[] = []

  constructor(
    bots: Collaborator[],
    initialCode: string,
    onCursorMove: (userId: string, line: number, column: number) => void,
    onCodeChange: (newCode: string, userId: string) => void,
  ) {
    this.bots = bots
    this.code = initialCode
    this.onCursorMove = onCursorMove
    this.onCodeChange = onCodeChange
  }

  start() {
    // Each bot moves cursor randomly
    this.bots.forEach((bot, index) => {
      const interval = setInterval(
        () => {
          const lines = this.code.split("\n")
          const randomLine = Math.floor(Math.random() * lines.length)
          const randomColumn = Math.floor(Math.random() * (lines[randomLine]?.length || 0))

          this.onCursorMove(bot.id, randomLine, randomColumn)
        },
        2000 + index * 500,
      )

      this.intervals.push(interval)
    })

    // Occasionally, a bot makes an edit
    const editInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance
        const bot = this.bots[Math.floor(Math.random() * this.bots.length)]
        this.simulateBotEdit(bot)
      }
    }, 5000)

    this.intervals.push(editInterval)
  }

  private simulateBotEdit(bot: Collaborator) {
    const edits = ["// Great idea!", "// TODO: Optimize this", "// Fixed typo", "// Added comment"]

    const lines = this.code.split("\n")
    const randomLine = Math.floor(Math.random() * lines.length)
    const edit = edits[Math.floor(Math.random() * edits.length)]

    lines.splice(randomLine, 0, edit)
    const newCode = lines.join("\n")

    this.code = newCode
    this.onCodeChange(newCode, bot.id)
  }

  updateCode(newCode: string) {
    this.code = newCode
  }

  stop() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []
  }
}
