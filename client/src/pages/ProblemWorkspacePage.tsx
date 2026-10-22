import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  History,
  FileCode,
  ShieldCheck,
  Award
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import type {
  Problem,
  TestCase,
  TestResultItem,
  RunCodeResponse,
  SubmitCodeResponse,
  Submission
} from '../../../shared/types';

export const ProblemWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<(Problem & { public_test_cases: TestCase[] }) | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Results state
  const [activeTab, setActiveTab] = useState<'statement' | 'submissions'>('statement');
  const [activeOutputTab, setActiveOutputTab] = useState<'tests' | 'custom'>('tests');
  const [selectedTestCase, setSelectedTestCase] = useState<number>(0);
  const [testResults, setTestResults] = useState<TestResultItem[] | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Celebration modal state for accepted submit
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationData, setCelebrationData] = useState<{
    newlyCompleted: boolean;
    completedCount?: number;
    scholarshipQualified?: boolean;
    qualificationReference?: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadProblem(parseInt(id, 10));
      loadSubmissions(parseInt(id, 10));
    }
  }, [id]);

  async function loadProblem(problemId: number) {
    setLoading(true);
    try {
      const res = await fetchApi<{ success: boolean; problem: Problem & { public_test_cases: TestCase[] } }>(
        `/problems/${problemId}`
      );
      if (res.problem) {
        setProblem(res.problem);
        setCode(res.problem.starter_code);
        setTestResults(null);
        setOverallStatus(null);
        setErrorMessage(null);
      }
    } catch (err: any) {
      console.error('[Problem Load Error]', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubmissions(problemId: number) {
    try {
      const res = await fetchApi<{ success: boolean; submissions: Submission[] }>(
        `/judge/submissions?problemId=${problemId}`
      );
      if (res.submissions) {
        setSubmissions(res.submissions);
      }
    } catch {
      setSubmissions([]);
    }
  }

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setOverallStatus(null);
    setErrorMessage(null);

    try {
      const res = await fetchApi<RunCodeResponse>('/judge/run', {
        method: 'POST',
        body: JSON.stringify({
          problemId: problem.id,
          code
        })
      });

      setTestResults(res.results);
      setOverallStatus(res.status);
      setExecutionTime(res.execution_time_ms);
      setSelectedTestCase(0);
    } catch (err: any) {
      setOverallStatus('Internal Judge Error');
      setErrorMessage(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setOverallStatus(null);
    setErrorMessage(null);

    try {
      const res = await fetchApi<SubmitCodeResponse>('/judge/submit', {
        method: 'POST',
        body: JSON.stringify({
          problemId: problem.id,
          code
        })
      });

      setTestResults(res.results);
      setOverallStatus(res.status);
      setExecutionTime(res.execution_time_ms);
      setErrorMessage(res.error_message || null);
      setSelectedTestCase(0);
      loadSubmissions(problem.id);

      if (res.status === 'Accepted') {
        setCelebrationData({
          newlyCompleted: res.newly_completed || false,
          completedCount: res.completed_count,
          scholarshipQualified: res.scholarship_qualified,
          qualificationReference: res.qualification_reference
        });
        setShowCelebration(true);
      }
    } catch (err: any) {
      setOverallStatus('Internal Judge Error');
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Wrong Answer':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Time Limit Exceeded':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Runtime Error':
      case 'Compilation Error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-slate-400 text-sm">
        Loading Python Workspace for Challenge #{id}...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Challenge Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested problem is unavailable or locked according to sequential progression.
        </p>
        <Link
          to="/problems"
          className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Return to Challenge List
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to="/problems"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="All Challenges"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
              #{problem.sequence_number}
            </span>
            <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {problem.title}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border capitalize ${
                problem.difficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : problem.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCode(problem.starter_code)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center space-x-1"
            title="Reset Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            <span>{isRunning ? 'Running...' : 'Run Public Tests'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Problem Description & Submissions History */}
        <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-900/30 overflow-hidden">
          {/* Tabs */}
          <div className="h-10 border-b border-slate-800 flex items-center px-4 space-x-4 shrink-0 bg-slate-950/50">
            <button
              onClick={() => setActiveTab('statement')}
              className={`text-xs font-semibold flex items-center space-x-1.5 h-full border-b-2 transition-colors ${
                activeTab === 'statement'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`text-xs font-semibold flex items-center space-x-1.5 h-full border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({submissions.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'statement' ? (
              <>
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <span className="font-semibold text-slate-300">{problem.topic}</span>
                    <span>•</span>
                    <span>Stage {problem.stage}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-400">{problem.points} Points</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{problem.title}</h2>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                    {problem.statement}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Input Format
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
                    {problem.input_format}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Output Format
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
                    {problem.output_format}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Constraints
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line">
                    {problem.constraints}
                  </div>
                </div>

                {/* Public Examples */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Public Test Examples
                  </h4>
                  {problem.public_test_cases.map((ex, i) => (
                    <div key={ex.id || i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-semibold text-indigo-400">Example {i + 1}</div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Input:</span>
                        <pre className="p-2 rounded bg-slate-900 text-xs text-slate-200 font-mono overflow-x-auto mt-0.5">
                          {ex.input_data}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Expected Output:</span>
                        <pre className="p-2 rounded bg-slate-900 text-xs text-emerald-400 font-mono overflow-x-auto mt-0.5">
                          {ex.expected_output}
                        </pre>
                      </div>
                      {ex.explanation && (
                        <p className="text-xs text-slate-400 italic">
                          Explanation: {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white mb-2">Previous Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400">No submissions recorded for this challenge yet.</p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded font-semibold border ${getStatusBadge(sub.status)}`}>
                            {sub.status}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {sub.passed_count}/{sub.total_tests} passed
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                          <span>{new Date(sub.submitted_at).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>{sub.execution_time_ms} ms</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setCode(sub.submitted_code)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Load Code
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Output Console */}
        <div className="w-full lg:w-7/12 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="h-10 border-b border-slate-800 bg-slate-950/70 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Python 3.15 Environment</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              UTF-8 • Tab: 4 spaces
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div className="flex-1 min-h-[300px] overflow-hidden bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 4
              }}
            />
          </div>

          {/* Bottom Execution Console */}
          <div className="h-64 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0">
            <div className="h-10 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Judge Output
                </span>
                {overallStatus && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(overallStatus)}`}>
                    {overallStatus}
                  </span>
                )}
                {executionTime !== null && (
                  <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{executionTime} ms</span>
                  </span>
                )}
              </div>

              {testResults && (
                <div className="flex items-center space-x-1 overflow-x-auto">
                  {testResults.map((tr, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTestCase(idx)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 border transition-colors ${
                        selectedTestCase === idx
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : tr.passed
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                          : 'border-rose-500/30 text-rose-400 bg-rose-950/20'
                      }`}
                    >
                      {tr.passed ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>
                        {tr.visibility === 'public' ? `Test ${idx + 1}` : `Private ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test Result Inspector */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300">
              {errorMessage && (
                <div className="p-3 mb-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 whitespace-pre-wrap">
                  {errorMessage}
                </div>
              )}

              {testResults && testResults[selectedTestCase] ? (
                <div className="space-y-3">
                  {testResults[selectedTestCase].visibility === 'public' ? (
                    <>
                      <div>
                        <span className="text-slate-400 uppercase text-[10px]">Test Input:</span>
                        <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 mt-1 overflow-x-auto">
                          {testResults[selectedTestCase].input}
                        </pre>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-400 uppercase text-[10px]">Your Output:</span>
                          <pre
                            className={`p-2 rounded border mt-1 overflow-x-auto ${
                              testResults[selectedTestCase].passed
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                                : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                            }`}
                          >
                            {testResults[selectedTestCase].actual_output || '(no stdout output)'}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[10px]">Expected Output:</span>
                          <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 mt-1 overflow-x-auto">
                            {testResults[selectedTestCase].expected_output}
                          </pre>
                        </div>
                      </div>
                      {testResults[selectedTestCase].error && (
                        <div>
                          <span className="text-rose-400 uppercase text-[10px]">Errors / Traceback:</span>
                          <pre className="p-2 rounded bg-rose-950/30 border border-rose-900 text-rose-300 mt-1 whitespace-pre-wrap">
                            {testResults[selectedTestCase].error}
                          </pre>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center space-x-2 text-indigo-400 font-sans font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Protected Private Test Suite</span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        Private test cases are protected to verify authentic algorithm performance and prevent hardcoded solutions.
                      </p>
                      <div className="text-xs font-semibold pt-1">
                        Status:{' '}
                        <span className={testResults[selectedTestCase].passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {testResults[selectedTestCase].passed ? 'Passed All Hidden Constraints' : 'Failed Hidden Test Criteria'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  Run or Submit your solution to inspect test outputs and execution diagnostics.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accepted Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Accepted!</h3>
              <p className="text-xs text-slate-300">
                100% of public and private test cases verified.
              </p>
            </div>

            {celebrationData?.scholarshipQualified ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/50 space-y-2 text-left">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <Award className="w-5 h-5" />
                  <span>YOU DID IT! SCHOLARSHIP SEAT EARNED!</span>
                </div>
                <p className="text-xs text-slate-200">
                  You have verified completion of all 1,000 Python challenges. Your Samagra free seat qualification is certified!
                </p>
                <div className="text-[11px] font-mono text-indigo-300">
                  Ref: {celebrationData.qualificationReference}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Progress Updated:
                </div>
                <div className="text-2xl font-extrabold text-indigo-400 font-mono">
                  {celebrationData?.completedCount} / 1,000
                </div>
                <p className="text-xs text-slate-400">
                  Challenge #{problem.sequence_number + 1} is now unlocked!
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Review Code
              </button>
              {celebrationData?.scholarshipQualified ? (
                <Link
                  to="/scholarship"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/30"
                >
                  View Seat Certificate
                </Link>
              ) : (
                <Link
                  to={`/problems/${problem.sequence_number + 1}`}
                  onClick={() => setShowCelebration(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1"
                >
                  <span>Next Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
