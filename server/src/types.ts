// ==============================================================================
// Samagra 1000 — Server Types & Interfaces
// ==============================================================================

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TestVisibility = 'public' | 'private';
export type PublicationStatus = 'draft' | 'published' | 'archived';

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'
  | 'Internal Judge Error'
  | 'Queued'
  | 'Processing';

export type QualificationStatus =
  | 'not_yet_qualified'
  | 'in_progress'
  | 'qualified'
  | 'seat_confirmation_pending'
  | 'seat_confirmed';

export interface Profile {
  id: string;
  display_name: string;
  email?: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: number;
  problem_id: number;
  visibility: TestVisibility;
  input_data: string;
  expected_output: string;
  weight?: number;
  explanation?: string;
}

export interface Problem {
  id: number;
  slug: string;
  sequence_number: number;
  title: string;
  statement: string;
  input_format: string;
  output_format: string;
  constraints: string;
  difficulty: Difficulty;
  topic: string;
  stage: number;
  points: number;
  time_limit: number;
  memory_limit: number;
  starter_code: string;
  reference_solution?: string;
  version: number;
  publication_status: PublicationStatus;
  created_at: string;
  updated_at: string;
  public_test_cases?: TestCase[];
}

export interface TestResultItem {
  test_index: number;
  visibility: TestVisibility;
  passed: boolean;
  status: SubmissionStatus;
  input?: string; // only for public
  expected_output?: string; // only for public
  actual_output?: string;
  error?: string;
  execution_time_ms?: number;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: number;
  submitted_code: string;
  judge_submission_id?: string;
  status: SubmissionStatus;
  passed_count: number;
  total_tests: number;
  execution_time_ms: number;
  memory_usage_mb: number;
  test_results: TestResultItem[];
  error_message?: string;
  submitted_at: string;
  evaluated_at?: string;
}

export interface ProblemCompletion {
  id: string;
  user_id: string;
  problem_id: number;
  accepted_submission_id: string;
  completed_at: string;
  points_awarded: number;
  question_version: number;
}

export interface StudentProgress {
  user_id: string;
  completed_count: number;
  easy_completed: number;
  medium_completed: number;
  hard_completed: number;
  total_points: number;
  current_unlocked_sequence: number;
  last_activity_at: string;
}

export interface ScholarshipQualification {
  id: string;
  user_id: string;
  qualification_status: QualificationStatus;
  completed_count_at_qualification: number;
  qualification_reference: string;
  qualified_at: string;
  confirmation_status: string;
  notes?: string;
  created_at: string;
  display_name?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  milestone_count: number;
  badge_icon: string;
  earned_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  completed_count: number;
  total_points: number;
  easy_completed: number;
  medium_completed: number;
  hard_completed: number;
  progress_percentage: number;
  is_qualified: boolean;
  last_activity_at: string;
  qualification_reference?: string;
}

export interface RunCodeRequest {
  problemId: number;
  code: string;
  customInput?: string;
}

export interface RunCodeResponse {
  status: SubmissionStatus;
  passed_count: number;
  total_tests: number;
  results: TestResultItem[];
  stdout?: string;
  stderr?: string;
  execution_time_ms: number;
}

export interface SubmitCodeRequest {
  problemId: number;
  code: string;
}

export interface SubmitCodeResponse {
  submission_id: string;
  status: SubmissionStatus;
  passed_count: number;
  total_tests: number;
  execution_time_ms: number;
  memory_usage_mb: number;
  results: TestResultItem[];
  error_message?: string;
  newly_completed?: boolean;
  completed_count?: number;
  total_points?: number;
  current_unlocked_sequence?: number;
  scholarship_qualified?: boolean;
  qualification_reference?: string;
}

export interface PlatformStats {
  total_registered: number;
  total_verified: number;
  total_submissions: number;
  total_accepted: number;
  total_completed_questions: number;
  scholarship_qualifications_count: number;
  easy_completed_total: number;
  medium_completed_total: number;
  hard_completed_total: number;
  total_published_problems: number;
}
