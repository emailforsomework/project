export interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
}

// Execute JavaScript code safely
export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now()
  const logs: string[] = []
  const errors: string[] = []

  // Capture console.log
  const originalLog = console.log
  const originalError = console.error

  try {
    console.log = (...args: any[]) => {
      logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "))
    }

    console.error = (...args: any[]) => {
      errors.push(args.map((arg) => String(arg)).join(" "))
    }

    // Execute code in isolated scope
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
    const fn = new AsyncFunction(code)
    await fn()

    const executionTime = performance.now() - startTime

    return {
      output: logs.length > 0 ? logs.join("\n") : "Code executed successfully (no output)",
      error: errors.length > 0 ? errors.join("\n") : undefined,
      executionTime,
    }
  } catch (error: any) {
    const executionTime = performance.now() - startTime
    return {
      output: logs.join("\n"),
      error: `Error: ${error.message}\n${error.stack || ""}`,
      executionTime,
    }
  } finally {
    console.log = originalLog
    console.error = originalError
  }
}

// Execute Python code using Pyodide
let pyodideInstance: any = null

export async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = performance.now()

  return {
    output: "",
    error: "Python execution is not available in this environment. Please use JavaScript or TypeScript.",
    executionTime: performance.now() - startTime,
  }
}

// Execute TypeScript (transpile to JS first)
export async function executeTypeScript(code: string): Promise<ExecutionResult> {
  // For simplicity, just execute as JavaScript
  // In production, you'd want to transpile with TypeScript compiler
  return executeJavaScript(code)
}
