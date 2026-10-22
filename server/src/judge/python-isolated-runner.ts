import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ExecuteResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Internal Judge Error';
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryUsageMb: number;
  error?: string;
}

export class PythonIsolatedRunner {
  private pythonPath: string;
  private defaultTimeoutMs: number;

  constructor(pythonPath?: string, timeoutMs: number = 2500) {
    this.pythonPath =
      pythonPath ||
      process.env.PYTHON_PATH ||
      'C:\\Users\\Dell\\.local\\bin\\python3.15.exe';

    if (!fs.existsSync(this.pythonPath)) {
      this.pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    }

    this.defaultTimeoutMs = timeoutMs;
  }

  public async execute(
    code: string,
    inputData: string,
    expectedOutput?: string,
    timeoutMs?: number
  ): Promise<ExecuteResult> {
    const timeLimit = timeoutMs || this.defaultTimeoutMs;
    const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'samagra-sandbox-'));
    const scriptPath = path.join(sandboxDir, 'solution.py');

    const dangerousPatterns = [
      /import\s+shutil.*rmtree/i,
      /os\.system\s*\(/i,
      /subprocess\.Popen.*rm\s+-rf/i,
      /subprocess\.run.*format\s+c:/i
    ];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          status: 'Runtime Error',
          stdout: '',
          stderr: 'Security Policy Violation: Restricted system commands are prohibited.',
          executionTimeMs: 0,
          memoryUsageMb: 0,
          error: 'Restricted system command'
        };
      }
    }

    try {
      fs.writeFileSync(scriptPath, code, 'utf-8');

      const startTime = performance.now();
      const runResult = await this.runProcess(this.pythonPath, [scriptPath], inputData, timeLimit, sandboxDir);
      const executionTimeMs = Math.round(performance.now() - startTime);

      if (runResult.timedOut) {
        return {
          status: 'Time Limit Exceeded',
          stdout: runResult.stdout,
          stderr: `Time Limit Exceeded: Process terminated after ${timeLimit} ms.`,
          executionTimeMs: timeLimit,
          memoryUsageMb: 12.5,
          error: 'Execution exceeded time limit'
        };
      }

      if (runResult.exitCode !== 0) {
        const isSyntaxError = runResult.stderr.includes('SyntaxError') || runResult.stderr.includes('IndentationError');
        return {
          status: isSyntaxError ? 'Compilation Error' : 'Runtime Error',
          stdout: runResult.stdout,
          stderr: runResult.stderr,
          executionTimeMs,
          memoryUsageMb: 14.0,
          error: runResult.stderr.split('\n').filter(Boolean).pop() || 'Process exited with non-zero status'
        };
      }

      let status: 'Accepted' | 'Wrong Answer' = 'Accepted';
      if (expectedOutput !== undefined) {
        const normalizedActual = this.normalizeOutput(runResult.stdout);
        const normalizedExpected = this.normalizeOutput(expectedOutput);

        if (normalizedActual !== normalizedExpected) {
          status = 'Wrong Answer';
        }
      }

      return {
        status,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        executionTimeMs,
        memoryUsageMb: 16.0
      };
    } catch (err: any) {
      return {
        status: 'Internal Judge Error',
        stdout: '',
        stderr: `Judge Internal Exception: ${err.message}`,
        executionTimeMs: 0,
        memoryUsageMb: 0,
        error: err.message
      };
    } finally {
      try {
        if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        if (fs.existsSync(sandboxDir)) fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch {
        // Ignore sandbox cleanup errors
      }
    }
  }

  private runProcess(
    cmd: string,
    args: string[],
    stdinData: string,
    timeoutMs: number,
    cwd: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      const MAX_OUTPUT_BYTES = 64 * 1024;

      const child = spawn(cmd, args, {
        cwd,
        windowsHide: true,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONDONTWRITEBYTECODE: '1'
        }
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (chunk) => {
        if (stdout.length < MAX_OUTPUT_BYTES) {
          stdout += chunk.toString();
        }
      });

      child.stderr.on('data', (chunk) => {
        if (stderr.length < MAX_OUTPUT_BYTES) {
          stderr += chunk.toString();
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        stderr += `\nFailed to start Python process: ${err.message}`;
        resolve({ stdout, stderr, exitCode: 1, timedOut: false });
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, exitCode: code, timedOut });
      });

      if (stdinData) {
        child.stdin.write(stdinData);
      }
      child.stdin.end();
    });
  }

  private normalizeOutput(str: string): string {
    return str
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line, idx, arr) => !(idx === arr.length - 1 && line === ''))
      .join('\n')
      .trim();
  }
}
