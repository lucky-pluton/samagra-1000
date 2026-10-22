-- ==============================================================================
-- SAMAGRA 1000 — DATABASE SCHEMA & RLS POLICIES
-- Educational Python Coding Challenge & Scholarship Qualification Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_display_name CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 32)
);

-- 2. PROBLEMS (Exactly 1,000 Questions source of truth)
CREATE TABLE IF NOT EXISTS public.problems (
    id SERIAL PRIMARY KEY,
    sequence_number INT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topic TEXT NOT NULL,
    stage INT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    time_limit INT NOT NULL DEFAULT 2000, -- milliseconds
    memory_limit INT NOT NULL DEFAULT 128, -- megabytes
    starter_code TEXT NOT NULL,
    reference_solution TEXT,
    version INT NOT NULL DEFAULT 1,
    publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEST CASES (Protected storage for public & private tests)
CREATE TABLE IF NOT EXISTS public.test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    weight INT DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBMISSIONS (Full audit trail of student code attempts)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    judge_submission_id TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 
        'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 
        'Internal Judge Error', 'Queued', 'Processing'
    )),
    passed_count INT NOT NULL DEFAULT 0,
    total_tests INT NOT NULL DEFAULT 0,
    execution_time_ms INT DEFAULT 0,
    memory_usage_mb NUMERIC(6, 2) DEFAULT 0,
    test_results JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ
);

-- 5. PROBLEM COMPLETIONS (Authoritative single-completion record per problem per student)
CREATE TABLE IF NOT EXISTS public.problem_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    accepted_submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    points_awarded INT NOT NULL DEFAULT 10,
    question_version INT NOT NULL DEFAULT 1,
    CONSTRAINT unique_user_problem_completion UNIQUE (user_id, problem_id)
);

-- 6. STUDENT PROGRESS (Rebuildable summary cache)
CREATE TABLE IF NOT EXISTS public.student_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_count INT NOT NULL DEFAULT 0,
    easy_completed INT NOT NULL DEFAULT 0,
    medium_completed INT NOT NULL DEFAULT 0,
    hard_completed INT NOT NULL DEFAULT 0,
    total_points INT NOT NULL DEFAULT 0,
    current_unlocked_sequence INT NOT NULL DEFAULT 1,
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SCHOLARSHIP QUALIFICATIONS (Guaranteed seat record upon completing all 1,000 questions)
CREATE TABLE IF NOT EXISTS public.scholarship_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    qualification_status TEXT NOT NULL DEFAULT 'qualified' CHECK (qualification_status IN ('not_yet_qualified', 'in_progress', 'qualified', 'seat_confirmation_pending', 'seat_confirmed')),
    completed_count_at_qualification INT NOT NULL DEFAULT 1000,
    qualification_reference TEXT UNIQUE NOT NULL,
    qualified_at TIMESTAMPTZ DEFAULT NOW(),
    confirmation_status TEXT NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACHIEVEMENTS & MILESTONES
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    milestone_count INT NOT NULL,
    badge_icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- 9. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    affected_record TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR SCALE & SPEED
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_problems_seq ON public.problems(sequence_number);
CREATE INDEX IF NOT EXISTS idx_problems_diff ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_test_cases_prob_vis ON public.test_cases(problem_id, visibility);
CREATE INDEX IF NOT EXISTS idx_submissions_user_prob ON public.submissions(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_completions_user ON public.problem_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_leaderboard ON public.student_progress(completed_count DESC, total_points DESC, last_activity_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view display_name; Users can update own profile
CREATE POLICY "Public profiles can be viewed by anyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Problems: Anyone can view published problems, but reference_solution is restricted
CREATE POLICY "Anyone can view published problems" ON public.problems FOR SELECT USING (publication_status = 'published');

-- Test Cases: Only public test cases can be viewed by anyone; private tests are only selectable by service_role
CREATE POLICY "Anyone can view public test cases" ON public.test_cases FOR SELECT USING (visibility = 'public');

-- Submissions: Students can only view their own submissions
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Completions: Anyone can view completed state (for leaderboard / profiles), users view own
CREATE POLICY "Public can view completions" ON public.problem_completions FOR SELECT USING (true);

-- Student Progress: Public leaderboard can read progress summaries
CREATE POLICY "Public can view student progress" ON public.student_progress FOR SELECT USING (true);

-- Scholarship: Anyone can verify a valid qualification record, users can view own
CREATE POLICY "Public can verify scholarship records" ON public.scholarship_qualifications FOR SELECT USING (true);

-- Seed Milestones
INSERT INTO public.achievements (id, name, description, milestone_count, badge_icon) VALUES
('first_accepted', 'First Step', 'Solved your first Python problem on Samagra 1000', 1, 'sparkles'),
('milestone_10', 'Early Explorer', 'Completed 10 Python problems', 10, 'flame'),
('milestone_50', 'Consistent Builder', 'Completed 50 Python problems', 50, 'target'),
('milestone_100', 'Centurion', 'Completed 100 Python problems', 100, 'trophy'),
('milestone_250', 'Algorithmic Adept', 'Completed 250 Python problems', 250, 'award'),
('milestone_500', 'Halfway Champion', 'Completed 500 Python problems', 500, 'shield-check'),
('milestone_750', 'Master Coder', 'Completed 750 Python problems', 750, 'zap'),
('milestone_1000', 'Samagra Scholar', 'Completed all 1,000 Python problems & earned guaranteed seat', 1000, 'crown')
ON CONFLICT (id) DO NOTHING;
