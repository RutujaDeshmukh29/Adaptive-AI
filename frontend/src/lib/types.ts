export type Band = "struggling" | "developing" | "competent" | "mastered";
export type Difficulty = "easy" | "medium" | "hard";
export type PathStatus = "done" | "current" | "in_progress" | "locked";
export type Trend = "improving" | "stable" | "declining" | "insufficient_data";

export type ActionType =
  | "upload_material" | "take_diagnostic" | "learn" | "revise"
  | "practice_easy" | "practice_medium" | "practice_hard"
  | "review_mistakes" | "advance" | "mock_test";

export interface User { 
  id: number; 
  name: string; 
  email: string; 
  role?: "student" | "parent";
  link_code?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  onboarding_complete: boolean;
}

export interface TopicMastery {
  topic_id: number;
  topic: string;
  mastery: number;
  band: Band;
  attempts?: number;
  correct_answers?: number;
  total_questions?: number;
  last_updated?: string;
}

export interface NextAction {
  action_type: ActionType;
  topic_id: number | null;
  topic: string | null;
  difficulty: Difficulty | null;
  title?: string;
  description?: string;
  reason: string;
  evidence?: Record<string, unknown>;
  cta?: { label: string; route: string };
}

export interface LearnerSnapshot {
  user: User;
  academic_level: string;
  subject: string;
  goal: string;
  experience_level: string;
  study_time_minutes: number;
  diagnostic_done: boolean;
  current_topic: { id: number; name: string } | null;
  overall_mastery: number;
  mastery: TopicMastery[];
  strengths: string[];
  weaknesses: string[];
  recent_trend: Trend;
  recent_mistake_tags: string[];
  streak_days: number;
  total_quizzes: number;
  materials_count: number;
}

export interface Material {
  id: number;
  filename: string;
  status: "processing" | "ready" | "failed";
  chunk_count: number;
  uploaded_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  concept_tag: string;
  difficulty: Difficulty;
  topic?: string;
  topic_id?: number;
  correct_index: number;
  explanation: string;
}

export interface QuizGenerateResponse {
  attempt_id: number;
  topic_id: number;
  topic: string;
  difficulty: Difficulty;
  selection_reason: string;
  questions: QuizQuestion[];
}

export interface ReviewItem {
  question_id: number;
  question: string;
  your_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  concept_tag: string;
}

export interface QuizSubmitResponse {
  attempt_id: number;
  topic_id: number;
  topic: string;
  difficulty: Difficulty;
  score: number;
  correct_count: number;
  total_questions: number;
  mastery_before: number;
  mastery_after: number;
  mastery_delta: number;
  band_before: Band;
  band_after: Band;
  review: ReviewItem[];
  weak_concepts: string[];
  path_changed: boolean;
  path_changes: { topic: string; from: PathStatus; to: PathStatus; reason: string }[];
  next_action: NextAction;
}

export type LearningMode = "adaptive" | "socratic" | "eli5" | "exam" | "code" | "interview";

export interface ChatMessageRequest {
  message: string;
  mode?: LearningMode;
  session_id?: string;
}

export interface ChatSource {
  material_id: number;
  filename: string;
  page: number;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  grounded: boolean;
  learner_context_used: {
    level: string;
    goal: string;
    topic: string | null;
    mastery: number | null;
    adaptation: string;
    mode?: LearningMode;
    mode_name?: string;
  };
  next_action: NextAction;
  message_id: number;
  session_id?: string;
}

export interface ChatSessionSummary {
  session_id: string;
  title: string;
  last_active: string;
  message_count: number;
}

export interface ChatSessionsResponse {
  sessions: ChatSessionSummary[];
}

export interface ChatHistoryMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  session_id?: string;
  created_at?: string;
}

export interface ChatHistoryResponse {
  messages: ChatHistoryMessage[];
}

export interface PathChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface PathResourceItem {
  title: string;
  type: "youtube" | "doc" | "paper" | "practice";
  url: string;
  channel_or_author?: string;
  duration_or_pages?: string;
  summary?: string;
}

export interface PathItem {
  order: number;
  topic_id: number;
  topic: string;
  status: PathStatus;
  mastery: number;
  reason: string;
  day_range?: string;
  estimated_hours?: number;
  checklist?: PathChecklistItem[];
  resources?: PathResourceItem[];
}

export interface PathResponse {
  goal: string;
  subject?: string;
  overall_progress: number;
  target_days?: number;
  items: PathItem[];
}

export interface ApiError { detail: string; code: string; }

export interface ParentStudentSummary {
  id: number;
  name: string;
  email: string;
  link_code: string;
  subject: string;
  goal: string;
  overall_mastery: number;
}

export interface StudentActivityItem {
  id: number;
  activity_type: string;
  topic_id: number | null;
  topic_name: string | null;
  description: string;
  result?: any;
  timestamp: string;
  time_str: string;
  date_str: string;
}

export interface ParentReport {
  student: {
    id: number;
    name: string;
    email: string;
    link_code: string;
    subject: string;
    goal: string;
    academic_level: string;
    study_time_goal: number;
    streak_days: number;
    overall_mastery: number;
  };
  today_stats: {
    active_minutes_today: number;
    total_actions_today: number;
    quizzes_today: number;
    chat_queries_today: number;
    uploads_today: number;
  };
  mastery_map: {
    topic_id: number;
    topic: string;
    mastery: number;
    band: Band;
  }[];
  strengths: string[];
  weaknesses: string[];
  recent_trend: Trend;
  activities: StudentActivityItem[];
  quiz_history: {
    id: number;
    score: number;
    difficulty: Difficulty;
    mastery_before: number;
    mastery_after: number;
    date: string;
  }[];
  ai_advisor: string;
  generated_at: string;
}

export interface TestCaseItem {
  input: string;
  expected: string;
  explanation?: string;
}

export interface Challenge {
  id: string;
  title: string;
  topic_id: number;
  topic_name: string;
  targeted_weakness: string;
  difficulty: "easy" | "medium" | "hard";
  type: "code" | "interview";
  scenario: string;
  requirements: string[];
  starter_code: string;
  test_cases: TestCaseItem[];
  hints: string[];
  solution: string;
  explanation: string;
  language?: string;
}

export interface EdgeCaseItem {
  case: string;
  handled: boolean;
  notes?: string;
}

export interface ChallengeEvaluation {
  passed: boolean;
  score: number;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  efficiency_analysis: string;
  edge_cases_analyzed: EdgeCaseItem[];
  mastery_updated?: boolean;
  new_mastery?: number;
}

export interface WeakTopicsSummary {
  current_topic: { id: number; name: string } | null;
  weak_concepts: string[];
  recommended_topics: {
    topic_id: number;
    name: string;
    mastery: number;
    attempts: number;
  }[];
}
