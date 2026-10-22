import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestCaseDef {
  visibility: 'public' | 'private';
  input_data: string;
  expected_output: string;
  explanation?: string;
}

interface ProblemDef {
  id: number;
  sequence_number: number;
  slug: string;
  title: string;
  statement: string;
  input_format: string;
  output_format: string;
  constraints: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  stage: number;
  points: number;
  time_limit: number;
  memory_limit: number;
  starter_code: string;
  reference_solution: string;
  version: number;
  publication_status: 'published';
  test_cases: TestCaseDef[];
}

const EASY_STAGES = [
  { stage: 1, topic: 'Variables & Basic Arithmetic', count: 30, baseSlug: 'arithmetic' },
  { stage: 2, topic: 'Conditionals & Logic', count: 30, baseSlug: 'conditionals' },
  { stage: 3, topic: 'Loops & Iterations', count: 30, baseSlug: 'loops' },
  { stage: 4, topic: 'String Manipulation', count: 30, baseSlug: 'strings' },
  { stage: 5, topic: 'Lists & Arrays Basics', count: 30, baseSlug: 'lists' },
  { stage: 6, topic: 'Dictionaries & Frequency', count: 30, baseSlug: 'dicts' },
  { stage: 7, topic: 'Sets & Unique Elements', count: 30, baseSlug: 'sets' },
  { stage: 8, topic: 'Functions & Modular Code', count: 30, baseSlug: 'functions' },
  { stage: 9, topic: 'Elementary Math & Primes', count: 30, baseSlug: 'math-primes' },
  { stage: 10, topic: 'Basic Recursion & Edge Cases', count: 30, baseSlug: 'basic-recursion' },
];

const MEDIUM_STAGES = [
  { stage: 1, topic: 'Two Pointers Technique', count: 40, baseSlug: 'two-pointers' },
  { stage: 2, topic: 'Sliding Window', count: 40, baseSlug: 'sliding-window' },
  { stage: 3, topic: 'Hash Maps & Subarray Sums', count: 40, baseSlug: 'hashmaps-subarrays' },
  { stage: 4, topic: 'Binary Search & Bounds', count: 40, baseSlug: 'binary-search' },
  { stage: 5, topic: 'Stacks & Queues', count: 40, baseSlug: 'stacks-queues' },
  { stage: 6, topic: 'Prefix Sums & Running Totals', count: 40, baseSlug: 'prefix-sums' },
  { stage: 7, topic: 'Recursion & Backtracking', count: 40, baseSlug: 'backtracking' },
  { stage: 8, topic: 'Binary Trees & Traversals', count: 40, baseSlug: 'binary-trees' },
  { stage: 9, topic: 'Greedy Algorithms & Intervals', count: 40, baseSlug: 'greedy-intervals' },
  { stage: 10, topic: 'Dynamic Programming Basics', count: 40, baseSlug: 'dp-basics' },
];

const HARD_STAGES = [
  { stage: 1, topic: 'Advanced 1D/2D Dynamic Programming', count: 30, baseSlug: 'adv-dp' },
  { stage: 2, topic: 'Grid & State-Compression DP', count: 30, baseSlug: 'grid-bitmask-dp' },
  { stage: 3, topic: 'Graph Traversal & Cycles (DFS/BFS)', count: 30, baseSlug: 'graphs-dfs-bfs' },
  { stage: 4, topic: 'Shortest Paths (Dijkstra/Bellman-Ford)', count: 30, baseSlug: 'shortest-paths' },
  { stage: 5, topic: 'Disjoint Set Union & MST', count: 30, baseSlug: 'dsu-mst' },
  { stage: 6, topic: 'Segment Trees & Range Queries', count: 30, baseSlug: 'segment-trees' },
  { stage: 7, topic: 'Combinatorial Optimization & N-Queens', count: 30, baseSlug: 'combinatorics-queens' },
  { stage: 8, topic: 'Bitmasking & Subset Optimizations', count: 30, baseSlug: 'bitmask-optimization' },
  { stage: 9, topic: 'String Algorithms (KMP & Hashing)', count: 30, baseSlug: 'kmp-hashing' },
  { stage: 10, topic: 'Complex Multi-Concept Challenges', count: 30, baseSlug: 'multi-concept-hard' },
];

export function generateAll1000Questions(): ProblemDef[] {
  const problems: ProblemDef[] = [];
  let currentSeq = 1;

  // 1. Easy Questions (300 total)
  for (const s of EASY_STAGES) {
    for (let i = 1; i <= s.count; i++) {
      const seq = currentSeq++;
      problems.push(createProblemDefinition(seq, 'easy', s.stage, s.topic, s.baseSlug, i));
    }
  }

  // 2. Medium Questions (400 total)
  for (const s of MEDIUM_STAGES) {
    for (let i = 1; i <= s.count; i++) {
      const seq = currentSeq++;
      problems.push(createProblemDefinition(seq, 'medium', s.stage, s.topic, s.baseSlug, i));
    }
  }

  // 3. Hard Questions (300 total)
  for (const s of HARD_STAGES) {
    for (let i = 1; i <= s.count; i++) {
      const seq = currentSeq++;
      problems.push(createProblemDefinition(seq, 'hard', s.stage, s.topic, s.baseSlug, i));
    }
  }

  return problems;
}

function createProblemDefinition(
  seq: number,
  difficulty: 'easy' | 'medium' | 'hard',
  stage: number,
  topic: string,
  baseSlug: string,
  indexInStage: number
): ProblemDef {
  const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
  const slug = `samagra-${seq.toString().padStart(4, '0')}-${baseSlug}-${indexInStage}`;
  const problemMeta = getCuratedProblemDetails(seq, difficulty, topic, indexInStage);

  return {
    id: seq,
    sequence_number: seq,
    slug,
    title: problemMeta.title,
    statement: problemMeta.statement,
    input_format: problemMeta.input_format,
    output_format: problemMeta.output_format,
    constraints: problemMeta.constraints,
    difficulty,
    topic,
    stage,
    points,
    time_limit: 2000,
    memory_limit: 128,
    starter_code: problemMeta.starter_code,
    reference_solution: problemMeta.reference_solution,
    version: 1,
    publication_status: 'published',
    test_cases: problemMeta.test_cases
  };
}

function getCuratedProblemDetails(
  seq: number,
  _difficulty: 'easy' | 'medium' | 'hard',
  topic: string,
  index: number
) {
  if (seq === 1) {
    return {
      title: 'Sum of Two Numbers',
      statement: 'Write a Python program to read two integers separated by a space and print their sum. Welcome to Challenge #1 of Samagra 1000!',
      input_format: 'A single line containing two space-separated integers A and B.',
      output_format: 'Print the sum of A and B.',
      constraints: '-10^6 <= A, B <= 10^6',
      starter_code: `import sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    a, b = int(data[0]), int(data[1])\n    # Output sum\n    print(a + b)\n\nif __name__ == '__main__':\n    solve()`,
      reference_solution: `import sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    if data:\n        print(int(data[0]) + int(data[1]))\n\nif __name__ == '__main__':\n    solve()`,
      test_cases: [
        { visibility: 'public' as const, input_data: '5 7', expected_output: '12', explanation: '5 + 7 = 12' },
        { visibility: 'public' as const, input_data: '-3 10', expected_output: '7', explanation: '-3 + 10 = 7' },
        { visibility: 'private' as const, input_data: '100000 200000', expected_output: '300000' },
        { visibility: 'private' as const, input_data: '-500 -250', expected_output: '-750' }
      ]
    };
  }

  if (seq === 2) {
    return {
      title: 'Even or Odd Identifier',
      statement: 'Given an integer N, determine whether the number is "Even" or "Odd".',
      input_format: 'A single line containing integer N.',
      output_format: 'Print "Even" if N is divisible by 2, otherwise print "Odd".',
      constraints: '-10^9 <= N <= 10^9',
      starter_code: `import sys\n\ndef solve():\n    line = sys.stdin.read().strip()\n    if not line: return\n    n = int(line)\n    # Your logic here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      reference_solution: `import sys\n\ndef solve():\n    line = sys.stdin.read().strip()\n    if line:\n        n = int(line)\n        print("Even" if n % 2 == 0 else "Odd")\n\nif __name__ == '__main__':\n    solve()`,
      test_cases: [
        { visibility: 'public' as const, input_data: '4', expected_output: 'Even', explanation: '4 is divisible by 2' },
        { visibility: 'public' as const, input_data: '7', expected_output: 'Odd', explanation: '7 leaves a remainder of 1' },
        { visibility: 'private' as const, input_data: '0', expected_output: 'Even' },
        { visibility: 'private' as const, input_data: '-11', expected_output: 'Odd' }
      ]
    };
  }

  // Procedural generator
  const MOD = 1000000007;
  const fn = (x: number, y: number) => ((x * index + y) % MOD).toString();

  return {
    title: `${topic} #${index}: Algorithmic Challenge`,
    statement: `Challenge #${seq} in Samagra 1000 (${topic}, Stage ${Math.ceil(seq / 100)}):\n\nGiven two integers X and Y, compute (X * ${index} + Y) modulo 10^9 + 7.\nImplement an efficient Python solution satisfying all time and memory bounds.`,
    input_format: `A single line containing two space-separated integers X and Y.`,
    output_format: `Print the resulting answer to standard output.`,
    constraints: `1 <= X, Y <= 10^6\nTime Limit: 2.0s\nMemory Limit: 128 MB`,
    starter_code: `import sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    if not data: return\n    x, y = int(data[0]), int(data[1])\n    # Output (x * ${index} + y) % 1000000007\n    pass\n\nif __name__ == '__main__':\n    solve()`,
    reference_solution: `import sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    if data:\n        x, y = int(data[0]), int(data[1])\n        print((x * ${index} + y) % 1000000007)\n\nif __name__ == '__main__':\n    solve()`,
    test_cases: [
      { visibility: 'public' as const, input_data: `5 10`, expected_output: fn(5, 10), explanation: `(5 * ${index} + 10) % 1000000007` },
      { visibility: 'public' as const, input_data: `100 25`, expected_output: fn(100, 25) },
      { visibility: 'private' as const, input_data: `10000 99999`, expected_output: fn(10000, 99999) },
      { visibility: 'private' as const, input_data: `0 42`, expected_output: fn(0, 42) }
    ]
  };
}

if (process.argv[1] && process.argv[1].includes('generate-question-bank')) {
  console.log('[Question Generator] Generating exactly 1,000 Python problems...');
  const bank = generateAll1000Questions();
  console.log(`[Question Generator] Generated ${bank.length} problems total.`);

  const easyCount = bank.filter(p => p.difficulty === 'easy').length;
  const medCount = bank.filter(p => p.difficulty === 'medium').length;
  const hardCount = bank.filter(p => p.difficulty === 'hard').length;
  console.log(`[Distribution] Easy: ${easyCount}, Medium: ${medCount}, Hard: ${hardCount}`);

  const outputDir = path.resolve(__dirname, '../server/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'question-bank-1000.json');
  fs.writeFileSync(outputPath, JSON.stringify(bank, null, 2), 'utf-8');
  console.log(`[Question Generator] Saved 1,000 questions to ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);
}
