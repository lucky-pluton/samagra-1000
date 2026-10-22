import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Problem,
  TestCase,
  Profile,
  Submission,
  ProblemCompletion,
  StudentProgress,
  ScholarshipQualification,
  LeaderboardEntry,
  PlatformStats
} from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private isSupabaseConfigured: boolean = false;

  private problems: Map<number, Problem> = new Map();
  private testCases: Map<number, TestCase[]> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private completions: Map<string, ProblemCompletion> = new Map();
  private progress: Map<string, StudentProgress> = new Map();
  private qualifications: Map<string, ScholarshipQualification> = new Map();
  private userAchievements: Map<string, Set<string>> = new Map();

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key && !url.includes('your-project-id') && !key.includes('your_supabase_service_role_key')) {
      try {
        this.supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        this.isSupabaseConfigured = true;
        console.log('[Database] Connected to Supabase PostgreSQL database.');
      } catch (err: any) {
        console.warn('[Database] Failed to initialize Supabase client:', err.message);
      }
    } else {
      console.log('[Database] Running with Local Authoritative Data Engine.');
    }

    this.initializeQuestionBank();
    this.seedDefaultStudent();
  }

  public getIsSupabaseConnected(): boolean {
    return this.isSupabaseConfigured;
  }

  private initializeQuestionBank() {
    const bankFile = path.resolve(__dirname, '../../data/question-bank-1000.json');
    if (fs.existsSync(bankFile)) {
      try {
        const raw = fs.readFileSync(bankFile, 'utf-8');
        const data = JSON.parse(raw);
        for (const item of data) {
          const { test_cases, ...probData } = item;
          this.problems.set(item.id, probData as Problem);
          if (Array.isArray(test_cases)) {
            const formattedTests: TestCase[] = test_cases.map((tc: any, idx: number) => ({
              id: idx + 1,
              problem_id: item.id,
              visibility: tc.visibility,
              input_data: tc.input_data,
              expected_output: tc.expected_output,
              explanation: tc.explanation
            }));
            this.testCases.set(item.id, formattedTests);
          }
        }
        console.log(`[Database] Successfully loaded ${this.problems.size} validated problems into memory.`);
      } catch (err: any) {
        console.error('[Database] Failed to read question-bank-1000.json:', err.message);
      }
    } else {
      console.warn(`[Database] question-bank-1000.json not found at ${bankFile}.`);
    }
  }

  private seedDefaultStudent() {
    const demoId = '00000000-0000-0000-0000-000000000001';
    this.profiles.set(demoId, {
      id: demoId,
      display_name: 'PioneerCoder',
      email: 'pioneer@samagra.annam.ai',
      is_verified: true,
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    this.progress.set(demoId, {
      user_id: demoId,
      completed_count: 0,
      easy_completed: 0,
      medium_completed: 0,
      hard_completed: 0,
      total_points: 0,
      current_unlocked_sequence: 1,
      last_activity_at: new Date().toISOString()
    });
  }

  public async getProblems(userId?: string): Promise<Array<Problem & { is_unlocked: boolean; is_completed: boolean }>> {
    const userProg = userId ? await this.getStudentProgress(userId) : null;
    const unlockedSeq = userProg ? userProg.current_unlocked_sequence : 1;

    const list: Array<Problem & { is_unlocked: boolean; is_completed: boolean }> = [];
    for (const prob of this.problems.values()) {
      if (prob.publication_status !== 'published') continue;
      const key = `${userId}:${prob.id}`;
      const isCompleted = this.completions.has(key);
      const isUnlocked = prob.sequence_number <= unlockedSeq || isCompleted;

      const { reference_solution, ...safeProblem } = prob;
      list.push({
        ...safeProblem,
        is_unlocked: isUnlocked,
        is_completed: isCompleted
      });
    }

    return list.sort((a, b) => a.sequence_number - b.sequence_number);
  }

  public async getProblemById(id: number): Promise<(Problem & { public_test_cases: TestCase[] }) | null> {
    const prob = this.problems.get(id);
    if (!prob || prob.publication_status !== 'published') return null;

    const allTests = this.testCases.get(id) || [];
    const publicTests = allTests.filter((t) => t.visibility === 'public');

    const { reference_solution, ...safeProblem } = prob;
    return {
      ...safeProblem,
      public_test_cases: publicTests
    };
  }

  public async getProblemWithAllTests(id: number): Promise<{ problem: Problem; testCases: TestCase[] } | null> {
    const prob = this.problems.get(id);
    if (!prob) return null;
    const testCases = this.testCases.get(id) || [];
    return { problem: prob, testCases };
  }

  public async getProfile(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) || null;
  }

  public async upsertProfile(userId: string, displayName: string, email?: string): Promise<Profile> {
    const existing = this.profiles.get(userId);
    const now = new Date().toISOString();
    const updated: Profile = {
      id: userId,
      display_name: displayName,
      email: email || existing?.email,
      is_verified: true,
      is_admin: existing?.is_admin || email?.endsWith('@samagra.annam.ai') || false,
      created_at: existing?.created_at || now,
      updated_at: now
    };
    this.profiles.set(userId, updated);

    if (!this.progress.has(userId)) {
      this.progress.set(userId, {
        user_id: userId,
        completed_count: 0,
        easy_completed: 0,
        medium_completed: 0,
        hard_completed: 0,
        total_points: 0,
        current_unlocked_sequence: 1,
        last_activity_at: now
      });
    }

    return updated;
  }

  public async getStudentProgress(userId: string): Promise<StudentProgress> {
    const prog = this.progress.get(userId);
    if (prog) return prog;

    const newProg: StudentProgress = {
      user_id: userId,
      completed_count: 0,
      easy_completed: 0,
      medium_completed: 0,
      hard_completed: 0,
      total_points: 0,
      current_unlocked_sequence: 1,
      last_activity_at: new Date().toISOString()
    };
    this.progress.set(userId, newProg);
    return newProg;
  }

  public async recordProblemCompletion(
    userId: string,
    problemId: number,
    submissionId: string
  ): Promise<{
    newly_completed: boolean;
    completed_count: number;
    easy_completed: number;
    medium_completed: number;
    hard_completed: number;
    total_points: number;
    current_unlocked_sequence: number;
    scholarship_qualified: boolean;
    qualification_reference?: string;
  }> {
    const prob = this.problems.get(problemId);
    if (!prob) throw new Error('Problem not found');

    const completionKey = `${userId}:${problemId}`;
    const alreadyCompleted = this.completions.has(completionKey);
    const currentProg = await this.getStudentProgress(userId);

    if (alreadyCompleted) {
      const isQual = this.qualifications.has(userId);
      const qual = this.qualifications.get(userId);
      return {
        newly_completed: false,
        completed_count: currentProg.completed_count,
        easy_completed: currentProg.easy_completed,
        medium_completed: currentProg.medium_completed,
        hard_completed: currentProg.hard_completed,
        total_points: currentProg.total_points,
        current_unlocked_sequence: currentProg.current_unlocked_sequence,
        scholarship_qualified: isQual,
        qualification_reference: qual?.qualification_reference
      };
    }

    // Record completion
    const completion: ProblemCompletion = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      problem_id: problemId,
      accepted_submission_id: submissionId,
      completed_at: new Date().toISOString(),
      points_awarded: prob.points,
      question_version: prob.version
    };
    this.completions.set(completionKey, completion);

    // Update progress
    currentProg.completed_count += 1;
    if (prob.difficulty === 'easy') currentProg.easy_completed += 1;
    if (prob.difficulty === 'medium') currentProg.medium_completed += 1;
    if (prob.difficulty === 'hard') currentProg.hard_completed += 1;
    currentProg.total_points += prob.points;
    currentProg.current_unlocked_sequence = Math.min(
      1000,
      Math.max(currentProg.current_unlocked_sequence, prob.sequence_number + 1)
    );
    currentProg.last_activity_at = new Date().toISOString();
    this.progress.set(userId, currentProg);

    // Milestone achievements
    const userAchs = this.userAchievements.get(userId) || new Set<string>();
    const milestones = [
      { id: 'first_accepted', target: 1 },
      { id: 'milestone_10', target: 10 },
      { id: 'milestone_50', target: 50 },
      { id: 'milestone_100', target: 100 },
      { id: 'milestone_250', target: 250 },
      { id: 'milestone_500', target: 500 },
      { id: 'milestone_750', target: 750 },
      { id: 'milestone_1000', target: 1000 }
    ];
    for (const m of milestones) {
      if (currentProg.completed_count >= m.target) {
        userAchs.add(m.id);
      }
    }
    this.userAchievements.set(userId, userAchs);

    // Automatic Scholarship Qualification:
    let isQualified = this.qualifications.has(userId);
    let qualRef: string | undefined = this.qualifications.get(userId)?.qualification_reference;

    if (currentProg.completed_count >= 1000 && !isQualified) {
      qualRef = `SAMAGRA-1000-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const qualification: ScholarshipQualification = {
        id: `qual-${Date.now()}`,
        user_id: userId,
        qualification_status: 'qualified',
        completed_count_at_qualification: currentProg.completed_count,
        qualification_reference: qualRef,
        qualified_at: new Date().toISOString(),
        confirmation_status: 'confirmed',
        notes: 'Verified automatic qualification: All 1,000 Python coding challenges completed.',
        created_at: new Date().toISOString()
      };
      this.qualifications.set(userId, qualification);
      isQualified = true;
    }

    return {
      newly_completed: true,
      completed_count: currentProg.completed_count,
      easy_completed: currentProg.easy_completed,
      medium_completed: currentProg.medium_completed,
      hard_completed: currentProg.hard_completed,
      total_points: currentProg.total_points,
      current_unlocked_sequence: currentProg.current_unlocked_sequence,
      scholarship_qualified: isQualified,
      qualification_reference: qualRef
    };
  }

  public async recordSubmission(sub: Submission): Promise<Submission> {
    this.submissions.set(sub.id, sub);
    return sub;
  }

  public async getUserSubmissions(userId: string, problemId?: number): Promise<Submission[]> {
    const list: Submission[] = [];
    for (const sub of this.submissions.values()) {
      if (sub.user_id === userId) {
        if (problemId === undefined || sub.problem_id === problemId) {
          list.push(sub);
        }
      }
    }
    return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public async getLeaderboard(_type: 'all-time' | 'weekly' = 'all-time'): Promise<LeaderboardEntry[]> {
    const entries: LeaderboardEntry[] = [];

    for (const [userId, prog] of this.progress.entries()) {
      const profile = this.profiles.get(userId);
      const isQual = this.qualifications.has(userId);
      const qual = this.qualifications.get(userId);

      entries.push({
        rank: 0,
        user_id: userId,
        display_name: profile?.display_name || `Coder-${userId.substring(0, 6)}`,
        completed_count: prog.completed_count,
        total_points: prog.total_points,
        easy_completed: prog.easy_completed,
        medium_completed: prog.medium_completed,
        hard_completed: prog.hard_completed,
        progress_percentage: Number(((prog.completed_count / 1000) * 100).toFixed(1)),
        is_qualified: isQual,
        last_activity_at: prog.last_activity_at,
        qualification_reference: qual?.qualification_reference
      });
    }

    entries.sort((a, b) => {
      if (b.completed_count !== a.completed_count) {
        return b.completed_count - a.completed_count;
      }
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return new Date(a.last_activity_at).getTime() - new Date(b.last_activity_at).getTime();
    });

    return entries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));
  }

  public async getScholarshipStatus(userId: string): Promise<ScholarshipQualification | null> {
    const qual = this.qualifications.get(userId);
    if (!qual) return null;
    const profile = this.profiles.get(userId);
    return {
      ...qual,
      display_name: profile?.display_name
    };
  }

  public async getPlatformStats(): Promise<PlatformStats> {
    let totalSubmissions = this.submissions.size;
    let totalAccepted = 0;
    for (const sub of this.submissions.values()) {
      if (sub.status === 'Accepted') totalAccepted++;
    }

    let easyTotal = 0;
    let medTotal = 0;
    let hardTotal = 0;
    for (const p of this.progress.values()) {
      easyTotal += p.easy_completed;
      medTotal += p.medium_completed;
      hardTotal += p.hard_completed;
    }

    return {
      total_registered: this.profiles.size,
      total_verified: Array.from(this.profiles.values()).filter((p) => p.is_verified).length,
      total_submissions: totalSubmissions,
      total_accepted: totalAccepted,
      total_completed_questions: this.completions.size,
      scholarship_qualifications_count: this.qualifications.size,
      easy_completed_total: easyTotal,
      medium_completed_total: medTotal,
      hard_completed_total: hardTotal,
      total_published_problems: this.problems.size
    };
  }
}

export const dbService = new DatabaseService();
