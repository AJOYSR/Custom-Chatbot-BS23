import { AIResponseService } from "../ai-response/ai-response.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

import { PaginationService } from "../pagination/pagination.service";
import { PaginationInterface } from "src/interface/common";
import {
  CreateVectorBatchDto,
  CreateVectorDto,
  SearchVectorByQuestionDto,
  SearchVectorDto,
  UpdateVectorDto,
} from "./dto/vectors.dto";
import { APIResponse } from "src/internal/api-response/api-response.service";

@Injectable()
export class VectorsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly aiResponse: AIResponseService,
    private readonly paginationService: PaginationService,
    private readonly APIResponse: APIResponse
  ) {}
  async create(createVectorDto: CreateVectorDto) {
    const client = await this.dbService.getClient();
    try {
      const { question, answer, companyId } = createVectorDto;
      const embedding = await this.aiResponse.generateEmbeddings(question);
      const result = await client.query(
        'INSERT INTO vectors (question, answer, "companyId", embedding) VALUES ($1, $2, $3, $4) RETURNING *',
        [question, answer, companyId, JSON.stringify(embedding)]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findAll(pagination: PaginationInterface) {
    const getVectors = async (query: any, options: any) => {
      const client = await this.dbService.getClient();
      try {
        const result = await client.query(
          "SELECT * FROM vectors OFFSET $1 LIMIT $2",
          [options.skip, options.limit]
        );
        return this.APIResponse.success(result.rows);
      } finally {
        client.release();
      }
    };

    const getVectorsCount = async (query: any) => {
      const client = await this.dbService.getClient();
      try {
        const result = await client.query("SELECT COUNT(*) FROM vectors");
        return parseInt(result.rows[0].count);
      } finally {
        client.release();
      }
    };

    return this.paginationService.paginate(
      getVectors,
      getVectorsCount,
      {},
      pagination
    );
  }

  // Add this method to the VectorsService class

  async createBatch(createVectorBatchDto: CreateVectorBatchDto) {
    const client = await this.dbService.getClient();

    try {
      // Begin transaction
      await client.query("BEGIN");

      const results = [];

      // Process each vector in the batch
      for (const vectorDto of createVectorBatchDto.vectors) {
        const { question, answer, companyId } = vectorDto;
        const embedding = await this.aiResponse.generateEmbeddings(question);

        const result = await client.query(
          'INSERT INTO vectors (question, answer, "companyId", embedding) VALUES ($1, $2, $3, $4) RETURNING *',
          [question, answer, companyId, JSON.stringify(embedding)]
        );

        results.push(result.rows[0]);
      }

      // Commit transaction
      await client.query("COMMIT");

      return this.APIResponse.success({
        success: true,
        count: results.length,
        vectors: results,
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findOne(id: string) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query("SELECT * FROM vectors WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        throw new NotFoundException(`Vector with ID ${id} not found`);
      }
      return this.APIResponse.success(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Add this method to the VectorsService class

  async update(id: string, updateVectorDto: UpdateVectorDto) {
    const client = await this.dbService.getClient();
    try {
      // First check if vector exists
      const existingVector = await client.query(
        "SELECT * FROM vectors WHERE id = $1",
        [id]
      );

      if (existingVector.rows.length === 0) {
        throw new NotFoundException(`Vector with ID ${id} not found`);
      }

      const { question, answer } = updateVectorDto;
      let embedding = undefined;

      // Only generate new embeddings if question is being updated
      if (question) {
        embedding = await this.aiResponse.generateEmbeddings(question);
      }

      // Build the update query dynamically based on what fields are provided
      const updates = [];
      const values = [];
      let paramCounter = 1;

      if (question) {
        updates.push(`question = $${paramCounter}`);
        values.push(question);
        paramCounter++;
      }

      if (answer) {
        updates.push(`answer = $${paramCounter}`);
        values.push(answer);
        paramCounter++;
      }

      if (embedding) {
        updates.push(`embedding = $${paramCounter}`);
        values.push(JSON.stringify(embedding));
        paramCounter++;
      }

      if (updates.length === 0) {
        return existingVector.rows[0];
      }

      // Add id to values array for WHERE clause
      values.push(id);

      const query = `
      UPDATE vectors 
      SET ${updates.join(", ")}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

      const result = await client.query(query, values);
      return this.APIResponse.success(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async searchSimilar(searchDto: SearchVectorDto) {
    const client = await this.dbService.getClient();
    try {
      const { embedding, limit = 5 } = searchDto;
      const result = await client.query(
        "SELECT *, (embedding <=> $1) as similarity FROM vectors ORDER BY similarity LIMIT $2",
        [embedding, limit]
      );
      return this.APIResponse.success(result.rows);
    } finally {
      client.release();
    }
  }

  async searchCosine(searchDto: SearchVectorDto) {
    const client = await this.dbService.getClient();
    try {
      const { embedding, limit = 5 } = searchDto;
      const result = await client.query(
        "SELECT *, (1 - (embedding <=> $1)) as cosine_similarity FROM vectors ORDER BY cosine_similarity DESC LIMIT $2",
        [embedding, limit]
      );
      return this.APIResponse.success(result.rows);
    } finally {
      client.release();
    }
  }
  async searchSimilarByQuestion(searchDto: SearchVectorByQuestionDto) {
    const client = await this.dbService.getClient();
    try {
      const { question, companyId, limit = 5 } = searchDto;
      const embeddingRes = await this.aiResponse.generateEmbeddings(question);
      const embedding = JSON.stringify(embeddingRes);

      const query = companyId
        ? `SELECT *, (embedding <=> $1) as similarity 
           FROM vectors 
           WHERE "companyId" = $2
           ORDER BY similarity 
           LIMIT $3`
        : `SELECT *, (embedding <=> $1) as similarity 
           FROM vectors 
           ORDER BY similarity 
           LIMIT $2`;

      const params = companyId
        ? [embedding, companyId, limit]
        : [embedding, limit];

      const result = await client.query(query, params);
      return this.APIResponse.success(result.rows);
    } finally {
      client.release();
    }
  }

  async searchCosineByQuestion(searchDto: SearchVectorByQuestionDto) {
    const client = await this.dbService.getClient();
    try {
      const { question, companyId, limit = 5 } = searchDto;
      const embeddingRes = await this.aiResponse.generateEmbeddings(question);
      const embedding = JSON.stringify(embeddingRes);

      const query = companyId
        ? `SELECT *, (1 - (embedding <=> $1)) as cosine_similarity 
           FROM vectors 
           WHERE "companyId" = $2
           ORDER BY cosine_similarity DESC 
           LIMIT $3`
        : `SELECT *, (1 - (embedding <=> $1)) as cosine_similarity 
           FROM vectors 
           ORDER BY cosine_similarity DESC 
           LIMIT $2`;

      const params = companyId
        ? [embedding, companyId, limit]
        : [embedding, limit];

      const result = await client.query(query, params);
      return this.APIResponse.success(result.rows);
    } finally {
      client.release();
    }
  }

  async searchHybridByQuestion(searchDto: SearchVectorByQuestionDto) {
    const client = await this.dbService.getClient();
    try {
      const { question, companyId, limit = 5 } = searchDto;
      const embeddingRes = await this.aiResponse.generateEmbeddings(question);
      const embedding = JSON.stringify(embeddingRes);

      // Hybrid search combines vector similarity with text similarity
      const query = companyId
        ? `SELECT *,
       (embedding <=> $1) * 0.7 + 
       (1 - similarity(question, $2::text)) * 0.3 as hybrid_score
       FROM vectors
       WHERE "companyId" = $3
       ORDER BY hybrid_score
       LIMIT $4`
        : `SELECT *,
       (embedding <=> $1) * 0.7 + 
       (1 - similarity(question, $2::text)) * 0.3 as hybrid_score
       FROM vectors
       ORDER BY hybrid_score
       LIMIT $3`;

      const params = companyId
        ? [embedding, question, companyId, limit]
        : [embedding, question, limit];

      const result = await client.query(query, params);
      return this.APIResponse.success(result.rows);
    } finally {
      client.release();
    }
  }
}
