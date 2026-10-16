export interface Question {
  questionID: number;
  quizID: number;
  questionText: string;
  questionType: string;
  options: string[];
  marks: number;
  correctAnswer?: string;
}

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface CreateQuestionRequest {
  questionText: string;
  questionType: QuestionType | string;
  options: string[];
  marks: number;
  correctAnswer: string;
}
