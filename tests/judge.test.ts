import { describe, it, expect } from 'vitest';
import { PythonIsolatedRunner } from '../server/src/judge/python-isolated-runner';
import { DatabaseService } from '../server/src/db/database-service';

describe('Isolated Python Judge & Private Test Security', () => {
  const runner = new PythonIsolatedRunner(undefined, 1500);
  const db = new DatabaseService();

  it('evaluates correct Python solution as Accepted', async () => {
    const code = `
import sys
x, y = map(int, sys.stdin.read().split())
print(x + y)
`;
    const res = await runner.execute(code, '15 27', '42');
    expect(res.status).toBe('Accepted');
    expect(res.stdout.trim()).toBe('42');
    expect(res.executionTimeMs).toBeGreaterThan(0);
  });

  it('evaluates incorrect Python solution as Wrong Answer', async () => {
    const code = `
import sys
x, y = map(int, sys.stdin.read().split())
print(x * y)
`;
    const res = await runner.execute(code, '15 27', '42');
    expect(res.status).toBe('Wrong Answer');
    expect(res.stdout.trim()).not.toBe('42');
  });

  it('evaluates syntax errors as Compilation Error', async () => {
    const code = `
def broken_syntax(
    print("missing closing paren")
`;
    const res = await runner.execute(code, '10 20', '30');
    expect(res.status).toBe('Compilation Error');
    expect(res.stderr).toContain('SyntaxError');
  });

  it('evaluates unhandled exceptions as Runtime Error', async () => {
    const code = `
x = 10 / 0
`;
    const res = await runner.execute(code, '', '');
    expect(res.status).toBe('Runtime Error');
    expect(res.stderr).toContain('ZeroDivisionError');
  });

  it('terminates infinite loops with Time Limit Exceeded', async () => {
    const code = `
while True:
    pass
`;
    const res = await runner.execute(code, '', '', 600);
    expect(res.status).toBe('Time Limit Exceeded');
    expect(res.stderr).toContain('Time Limit Exceeded');
  });

  it('never exposes private test cases or reference solution in client-facing API', async () => {
    const publicProb = await db.getProblemById(1);
    expect(publicProb).not.toBeNull();
    // Reference solution must be excluded
    expect((publicProb as any).reference_solution).toBeUndefined();
    // Only public test cases should be returned
    expect(publicProb?.public_test_cases).toBeDefined();
    for (const tc of publicProb!.public_test_cases) {
      expect(tc.visibility).toBe('public');
    }

    // Full tests on server must contain both public and private
    const serverDetails = await db.getProblemWithAllTests(1);
    const hasPrivate = serverDetails?.testCases.some(tc => tc.visibility === 'private');
    expect(hasPrivate).toBe(true);
  });
});
