import type {
  Problem,
  TestCase,
  StudentProgress,
  ScholarshipQualification,
  LeaderboardEntry,
  RunCodeResponse,
  SubmitCodeResponse,
  PlatformStats
} from '../../../shared/types';

const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userId = localStorage.getItem('samagra_user_id') || '00000000-0000-0000-0000-000000000001';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  async getProblems(): Promise<Array<Problem & { is_unlocked: boolean; is_completed: boolean }>> {
    const res = await fetchApi<{ success: boolean; problems: Array<Problem & { is_unlocked: boolean; is_completed: boolean }> }>('/problems');
    return res.problems;
  },

  async getProblem(id: number): Promise<Problem & { public_test_cases: TestCase[] }> {
    const res = await fetchApi<{ success: boolean; problem: Problem & { public_test_cases: TestCase[] } }>(`/problems/${id}`);
    return res.problem;
  },

  async runCode(problemId: number, code: string): Promise<RunCodeResponse> {
    return fetchApi<RunCodeResponse>('/judge/run', {
      method: 'POST',
      body: JSON.stringify({ problemId, code })
    });
  },

  async submitCode(problemId: number, code: string): Promise<SubmitCodeResponse> {
    return fetchApi<SubmitCodeResponse>('/judge/submit', {
      method: 'POST',
      body: JSON.stringify({ problemId, code })
    });
  },

  async getProgress(userId?: string): Promise<StudentProgress> {
    const res = await fetchApi<{ success: boolean; stats: { progress: StudentProgress } }>('/dashboard/stats');
    return res.stats.progress;
  },

  async getScholarshipStatus(userId?: string): Promise<ScholarshipQualification | null> {
    const res = await fetchApi<{ success: boolean; qualification: ScholarshipQualification | null }>(`/scholarship/status${userId ? `?userId=${userId}` : ''}`);
    return res.qualification;
  },

  async getLeaderboard(type: 'all-time' | 'weekly' = 'all-time'): Promise<LeaderboardEntry[]> {
    const res = await fetchApi<{ success: boolean; leaderboard: LeaderboardEntry[] }>(`/leaderboard?type=${type}`);
    return res.leaderboard;
  },

  async getAdminStats(adminSecret: string): Promise<PlatformStats> {
    const res = await fetchApi<{ success: boolean; stats: PlatformStats }>('/admin/stats', {
      headers: { 'x-admin-secret': adminSecret }
    });
    return res.stats;
  },

  async getAdminStudents(adminSecret: string): Promise<{ students: any[] }> {
    return fetchApi<{ students: any[] }>('/admin/students', {
      headers: { 'x-admin-secret': adminSecret }
    });
  },

  async getAdminSubmissions(adminSecret: string): Promise<{ submissions: any[] }> {
    return fetchApi<{ submissions: any[] }>('/admin/submissions', {
      headers: { 'x-admin-secret': adminSecret }
    });
  }
};
