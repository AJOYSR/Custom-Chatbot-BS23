import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QnARepository {
  constructor(private readonly dbService: DatabaseService) {}

  async insertVector(
    question: string,
    answer: string,
    botId: string,
    embedding: any,
  ) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'INSERT INTO question_n_answers (question, answer, "botId", embedding) VALUES ($1, $2, $3, $4) RETURNING id, question, answer, "botId", "createdAt", "updatedAt"',
        [question, answer, botId, JSON.stringify(embedding)],
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findAllVectors(skip: number, limit: number) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT id, question, answer, "botId", "createdAt", "updatedAt" FROM question_n_answers OFFSET $1 LIMIT $2',
        [skip, limit],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async countVectors() {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT COUNT(*) FROM question_n_answers',
      );
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  async findVectorById(id: string) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT id, question, answer, "botId", "createdAt", "updatedAt" FROM question_n_answers WHERE id = $1',
        [id],
      );
      if (result.rows.length === 0) {
        throw new NotFoundException(`Vector with ID ${id} not found`);
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateVector(id: string, updateFields: any[], updateValues: any[]) {
    const client = await this.dbService.getClient();
    try {
      // Add id to values array for WHERE clause
      updateValues.push(id);

      const query = `
        UPDATE question_n_answers 
        SET ${updateFields.join(', ')}
        WHERE id = $${updateValues.length}
        RETURNING id, question, answer, "botId", "createdAt", "updatedAt"
      `;

      const result = await client.query(query, updateValues);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async searchBySimilarity(embedding: any, limit: number) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT id, question, answer, "botId", "createdAt", "updatedAt", (embedding <=> $1) as similarity FROM question_n_answers ORDER BY similarity LIMIT $2',
        [embedding, limit],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchByCosine(embedding: any, limit: number) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT id, question, answer, "botId", "createdAt", "updatedAt", (1 - (embedding <=> $1)) as cosine_similarity FROM question_n_answers ORDER BY cosine_similarity DESC LIMIT $2',
        [embedding, limit],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchSimilarByQuestion(
    embedding: string,
    botId: string | undefined,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      const query = botId
        ? `SELECT id, question, answer, "botId", "createdAt", "updatedAt", (embedding <=> $1) as similarity 
           FROM question_n_answers 
           WHERE "botId" = $2
           ORDER BY similarity 
           LIMIT $3`
        : `SELECT id, question, answer, "botId", "createdAt", "updatedAt", (embedding <=> $1) as similarity 
           FROM question_n_answers 
           ORDER BY similarity 
           LIMIT $2`;

      const params = botId ? [embedding, botId, limit] : [embedding, limit];
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchCosineByQuestion(
    embedding: string,
    botId: string | undefined,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      const query = botId
        ? `SELECT id, question, answer, "botId", "createdAt", "updatedAt", (1 - (embedding <=> $1)) as cosine_similarity 
           FROM question_n_answers 
           WHERE "botId" = $2
           ORDER BY cosine_similarity DESC 
           LIMIT $3`
        : `SELECT id, question, answer, "botId", "createdAt", "updatedAt", (1 - (embedding <=> $1)) as cosine_similarity 
           FROM question_n_answers 
           ORDER BY cosine_similarity DESC 
           LIMIT $2`;

      const params = botId ? [embedding, botId, limit] : [embedding, limit];
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchHybridByQuestion(
    embedding: string,
    question: string,
    botId: string | undefined,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      const query = botId
        ? `SELECT id, question, answer, "botId", "createdAt", "updatedAt",
           (embedding <=> $1) * 0.7 + 
           (1 - similarity(question, $2::text)) * 0.3 as hybrid_score
           FROM question_n_answers
           WHERE "botId" = $3
           ORDER BY hybrid_score
           LIMIT $4`
        : `SELECT id, question, answer, "botId", "createdAt", "updatedAt",
           (embedding <=> $1) * 0.7 + 
           (1 - similarity(question, $2::text)) * 0.3 as hybrid_score
           FROM question_n_answers
           ORDER BY hybrid_score
           LIMIT $3`;

      const params = botId
        ? [embedding, question, botId, limit]
        : [embedding, question, limit];

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async beginTransaction() {
    const client = await this.dbService.getClient();
    await client.query('BEGIN');
    return client;
  }

  async commitTransaction(client: any) {
    await client.query('COMMIT');
  }

  async rollbackTransaction(client: any) {
    await client.query('ROLLBACK');
  }
}
