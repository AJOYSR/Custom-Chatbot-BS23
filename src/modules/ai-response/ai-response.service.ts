import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

// Define an interface for the Ollama embeddings response
interface OllamaEmbeddingsResponse {
  model: string;
  embedding: number[];
}

@Injectable()
export class AIResponseService {
  private readonly logger = new Logger(AIResponseService.name);
  private readonly ollamaEndpoint = "http://localhost:11434";
  private readonly model = "nomic-embed-text:latest";

  constructor() {}

  /**
   * Generate embeddings for a given text using Ollama's nomic-embed-text model
   * @param text The text to generate embeddings for
   * @returns Promise<number[]> The embedding vector
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await axios.post<OllamaEmbeddingsResponse>(
        `${this.ollamaEndpoint}/api/embeddings`,
        {
          model: this.model,
          prompt: text,
        }
      );

      if (!response.data || !response.data.embedding) {
        throw new Error("No embedding returned from Ollama");
      }

      return response.data.embedding;
    } catch (error) {
      this.logger.error(
        `Error generating embeddings: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new Error(
        `Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate embeddings for both question and answer
   * @param question The question text
   * @param answer The answer text
   * @returns Promise<number[]> The combined embedding vector
   */
  async generateCombinedEmbeddings(
    question: string,
    answer: string
  ): Promise<number[]> {
    try {
      const combinedText = `Question: ${question}\nAnswer: ${answer}`;
      return await this.generateEmbeddings(combinedText);
    } catch (error) {
      this.logger.error(
        `Error generating combined embeddings: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new Error(
        `Failed to generate combined embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check if Ollama service is available and the model is ready
   * @returns Promise<boolean>
   */
  async checkOllamaStatus(): Promise<boolean> {
    try {
      await axios.get(`${this.ollamaEndpoint}/api/tags`);
      return true;
    } catch (error) {
      this.logger.error(
        `Ollama service check failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return false;
    }
  }
}
