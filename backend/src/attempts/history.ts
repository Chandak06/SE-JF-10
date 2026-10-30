
export interface AttemptHistoryItem {
  attemptId: string
  quizId: string
  quizTitle: string
  subject: string | null
  score: number
  percentage: number
  answersSubmitted: number
  submittedAt: string | null
}

export interface AttemptHistoryPage {
  attempts: AttemptHistoryItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AttemptHistoryRepository {
  listUserAttempts(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<AttemptHistoryPage>
}
