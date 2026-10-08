import { fork } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHILD_WORKER_PATH = path.resolve(__dirname, '../workers/sandboxChild.js');

/**
 * Executes untrusted candidate code inside an isolated Node.js child process.
 * Guarantees zero execution inside the main API server process.
 */
export const executeInSandbox = ({
  code,
  language = 'javascript',
  testCases = [],
  timeLimitMs = 2000,
  memoryLimitMB = 256,
}) => {
  return new Promise((resolve) => {
    const cleanEnv = {
      NODE_ENV: 'sandbox',
      PATH: process.env.PATH || process.env.Path,
      Path: process.env.Path || process.env.PATH,
      SystemRoot: process.env.SystemRoot || 'C:\\Windows',
      windir: process.env.windir || 'C:\\Windows',
      LOCALAPPDATA: process.env.LOCALAPPDATA || '',
      APPDATA: process.env.APPDATA || '',
      USERPROFILE: process.env.USERPROFILE || '',
      TEMP: process.env.TEMP || os.tmpdir(),
      TMP: process.env.TMP || os.tmpdir(),
    };

    const maxOldSpaceSize = Math.max(64, Math.min(memoryLimitMB, 512));

    // Spawn isolated child process with memory cap
    const child = fork(CHILD_WORKER_PATH, [], {
      execArgv: [`--max-old-space-size=${maxOldSpaceSize}`],
      env: cleanEnv,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    let stdoutData = '';
    let stderrData = '';
    let isSettled = false;

    // Hard watchdog timer: kill process if it exceeds overall allowable test run time
    const isCompiledLang = ['cpp', 'c++', 'c', 'java'].includes((language || '').toLowerCase());
    const compileAllowance = isCompiledLang ? 9000 : 2500;
    const hardTimeoutMs = (timeLimitMs * Math.max(1, testCases.length)) + compileAllowance;
    const watchdog = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try {
          child.kill('SIGKILL');
        } catch {}
        resolve({
          success: false,
          verdict: 'Time Limit Exceeded',
          error: `Execution terminated: exceeded maximum time allowance of ${timeLimitMs}ms.`,
          results: testCases.map((tc, idx) => ({
            testIndex: idx + 1,
            passed: false,
            status: 'Time Limit Exceeded',
            executionTime: timeLimitMs,
            memoryUsage: memoryLimitMB,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            error: 'Time Limit Exceeded',
            isHidden: !!tc.isHidden,
          })),
          totalExecutionTime: timeLimitMs,
          memoryUsage: memoryLimitMB,
          consoleLogs: [],
        });
      }
    }, hardTimeoutMs);

    child.stdout?.on('data', (d) => {
      stdoutData += d.toString();
    });
    child.stderr?.on('data', (d) => {
      stderrData += d.toString();
    });

    child.on('message', (response) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(watchdog);
        child.kill();
        resolve(response);
      }
    });

    child.on('error', (err) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(watchdog);
        resolve({
          success: false,
          verdict: 'Runtime Error',
          error: err.message || 'Worker process error',
          results: [],
          consoleLogs: [],
        });
      }
    });

    child.on('exit', (code, signal) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(watchdog);
        const verdict = signal === 'SIGKILL' ? 'Time Limit Exceeded' : (code !== 0 ? 'Runtime Error' : 'Accepted');
        resolve({
          success: false,
          verdict,
          error: stderrData || `Child process exited with code ${code} (${signal || 'none'})`,
          results: [],
          consoleLogs: [],
        });
      }
    });

    // Send execution payload to isolated child process
    child.send({
      code,
      language: (language || 'javascript').toLowerCase(),
      testCases,
      timeLimitMs,
      memoryLimitMB,
    });
  });
};
