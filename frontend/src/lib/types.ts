export type Band = "struggling" | "developing" | "competent" | "mastered";
export type Difficulty = "easy" | "medium" | "hard";
export type PathStatus = "done" | "current" | "in_progress" | "locked";
export type Trend = "improving" | "stable" | "declining" | "insufficient_data";

export type ActionType =
  | "upload_material" | "take_diagnostic" | "learn" | "revise"
  | "practice_easy" | "practice_medium" | "practice_hard"
  | "review_mistakes" | "advance" | "mock_test";

export interface User { id: number; name: string; email: string; }

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
  };
  next_action: NextAction;
  message_id: number;
}

export interface PathItem {
  order: number;
  topic_id: number;
  topic: string;
  status: PathStatus;
  mastery: number;
  reason: string;
}

export interface PathResponse {
  goal: string;
  overall_progress: number;
  items: PathItem[];
}

export interface ApiError { detail: string; code: string; }
