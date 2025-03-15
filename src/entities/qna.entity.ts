export interface QnaInterface {
  id: string;
  question: string;
  answer: string;
  botId: string;
  createdAt: Date;
  updatedAt: Date;
  cosine_similarity?: string;
  cosine_score?: string;
  hybrid_score?: string;
  combined_score?: string;
}
