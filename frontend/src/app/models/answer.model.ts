export interface Answer {
  questionID: number;
  response: string;
  quizID: number;
  attemptNumber: number;
  isCorrect?: boolean;
  marksAwarded?: number;
}


export interface AnswerResult {
  questionID: number;
  questionText: string;
  response: string;
  quizID: number;
  attemptNumber: number;
  isCorrect: boolean;
  marksAwarded: number;
  totalMarks: number;
}