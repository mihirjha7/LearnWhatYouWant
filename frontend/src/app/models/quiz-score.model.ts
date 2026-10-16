export interface QuizScore {
  quizID: number;
  userID: number;
  // score: number;
  attemptNumber: number;
}

export interface QuizScoreResponse {
    quizID: number;
    userID: number;
    score: number;
    attemptNumber: number;
}
