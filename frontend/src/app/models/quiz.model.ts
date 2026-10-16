import { Question } from "./question.model";

export interface Quiz {
  quizID: number;
  courseID: number | null;
  title: string | null;
  totalMarks: number | null;
  timeLimit: number | null;
  attemptsAllowed: number | null;
  createdAt: Date | null;
  questions: Question[] | null;
}

export interface StartQuizResponse {
  courseID: any;
  quizID: number;
  title: string;
  totalMarks: number | null;
  timeLimit: number | null;
  attemptsAllowed: number | null;
  currentAttemptNumber: number;
  remainingAttempts: number | null;
}

export interface CreateQuizRequest {
  courseID: number;
  title: string;
  totalMarks?: number;
  timeLimit?: number;
  attemptsAllowed?: number;
}

export interface CreateQuizResponse {
  id?: number;
  quizId?: number;
  quizID?: number;
  [key: string]: any;
}
