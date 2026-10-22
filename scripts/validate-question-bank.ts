import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProblemValidationReport {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  uniqueIdsValid: boolean;
  uniqueSequencesValid: boolean;
  missingFieldsCount: number;
  invalidTestCasesCount: number;
  difficultyDistributionValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateQuestionBank(bankPath?: string): ProblemValidationReport {
  const filePath = bankPath || path.resolve(__dirname, '../server/data/question-bank-1000.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Question bank file not found at: ${filePath}. Run generate-question-bank first.`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const report: ProblemValidationReport = {
    totalQuestions: data.length,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    uniqueIdsValid: true,
    uniqueSequencesValid: true,
    missingFieldsCount: 0,
    invalidTestCasesCount: 0,
    difficultyDistributionValid: false,
    errors: [],
    warnings: []
  };

  const seenIds = new Set<number>();
  const seenSequences = new Set<number>();
  const seenSlugs = new Set<string>();

  for (const p of data) {
    if (seenIds.has(p.id)) {
      report.errors.push(`Duplicate ID: ${p.id}`);
      report.uniqueIdsValid = false;
    }
    seenIds.add(p.id);

    if (seenSequences.has(p.sequence_number)) {
      report.errors.push(`Duplicate Sequence Number: ${p.sequence_number}`);
      report.uniqueSequencesValid = false;
    }
    seenSequences.add(p.sequence_number);

    if (seenSlugs.has(p.slug)) {
      report.warnings.push(`Duplicate Slug: ${p.slug}`);
    }
    seenSlugs.add(p.slug);

    const requiredFields = [
      'id',
      'slug',
      'title',
      'statement',
      'input_format',
      'output_format',
      'constraints',
      'difficulty',
      'topic',
      'stage',
      'points',
      'starter_code',
      'reference_solution',
      'test_cases'
    ];

    for (const field of requiredFields) {
      if (p[field] === undefined || p[field] === null || p[field] === '') {
        report.missingFieldsCount++;
        report.errors.push(`Problem #${p.sequence_number} missing required field '${field}'`);
      }
    }

    if (p.difficulty === 'easy') report.easyCount++;
    else if (p.difficulty === 'medium') report.mediumCount++;
    else if (p.difficulty === 'hard') report.hardCount++;
    else {
      report.errors.push(`Problem #${p.sequence_number} has invalid difficulty: '${p.difficulty}'`);
    }

    if (!Array.isArray(p.test_cases) || p.test_cases.length < 2) {
      report.invalidTestCasesCount++;
      report.errors.push(`Problem #${p.sequence_number} has fewer than 2 test cases`);
    } else {
      const publicTests = p.test_cases.filter((t: any) => t.visibility === 'public');
      const privateTests = p.test_cases.filter((t: any) => t.visibility === 'private');

      if (publicTests.length === 0) {
        report.invalidTestCasesCount++;
        report.errors.push(`Problem #${p.sequence_number} has NO public test cases`);
      }
      if (privateTests.length === 0) {
        report.invalidTestCasesCount++;
        report.errors.push(`Problem #${p.sequence_number} has NO private test cases`);
      }
    }
  }

  report.difficultyDistributionValid =
    report.totalQuestions === 1000 &&
    report.easyCount === 300 &&
    report.mediumCount === 400 &&
    report.hardCount === 300;

  if (!report.difficultyDistributionValid) {
    report.errors.push(
      `Distribution mismatch: Expected 300 Easy, 400 Medium, 300 Hard (Total: 1000). Found: ${report.easyCount} Easy, ${report.mediumCount} Medium, ${report.hardCount} Hard (Total: ${report.totalQuestions})`
    );
  }

  return report;
}

if (process.argv[1] && process.argv[1].includes('validate-question-bank')) {
  console.log('[Validator] Validating Question Bank...');
  try {
    const report = validateQuestionBank();
    console.log('--------------------------------------------------');
    console.log(`Total Questions: ${report.totalQuestions}`);
    console.log(`Easy: ${report.easyCount} / 300`);
    console.log(`Medium: ${report.mediumCount} / 400`);
    console.log(`Hard: ${report.hardCount} / 300`);
    console.log(`Unique IDs Valid: ${report.uniqueIdsValid ? 'PASS' : 'FAIL'}`);
    console.log(`Unique Sequences Valid: ${report.uniqueSequencesValid ? 'PASS' : 'FAIL'}`);
    console.log(`Missing Fields Count: ${report.missingFieldsCount}`);
    console.log(`Invalid Test Cases: ${report.invalidTestCasesCount}`);
    console.log(`Difficulty Distribution: ${report.difficultyDistributionValid ? 'PASS (100% compliant)' : 'FAIL'}`);
    console.log('--------------------------------------------------');

    if (report.errors.length > 0) {
      console.error(`Validation found ${report.errors.length} errors:`);
      report.errors.slice(0, 10).forEach(e => console.error(` - ${e}`));
      process.exit(1);
    } else {
      console.log('VALIDATION SUCCESSFUL: All 1,000 questions verified and compliant!');
      process.exit(0);
    }
  } catch (err: any) {
    console.error('[Validator Error]', err.message);
    process.exit(1);
  }
}
