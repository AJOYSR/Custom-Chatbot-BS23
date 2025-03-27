/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { questionGeneratorPrompt, textGeneratorPrompt } from 'src/prompts';
import { extractJsonFromText } from 'src/utils';

dotenv.config();

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private embeddingModel: any;
  private textModel: any;
  private questionGeneratorModel: any;

  constructor() {
    // Initialize Google Generative AI with your API key
    this.genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );

    // Initialize the embedding model
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    // Initialize the question generation model
    this.questionGeneratorModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: questionGeneratorPrompt,
    });

    // Initialize the text generation model
    this.textModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: textGeneratorPrompt,
    });
  }

  /**
   * Enhances the FAQ answer to make it sound more natural and human-like
   * @param question - The user's question
   * @param answer - The original answer from the FAQ database
   * @returns Enhanced answer that sounds more conversational
   */
  async enhanceAnswer(question: string, answer: string): Promise<string> {
    // System prompt designed to guide the AI to enhance the answer
    const prompt = `
The user's question is: 
${question}

The original answer is: 
${answer}

Rewrite this answer to make it more conversational and helpful while maintaining accuracy.
Format your response using proper markdown including headings, bold/italic text, lists, and other markdown elements as appropriate.
`;

    try {
      const result = await this.textModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      });

      const response = result.response;

      // Get the raw text with markdown formatting preserved
      return response.text();
    } catch (error) {
      console.error('Error enhancing answer:', error);
      // Return the original answer if enhancement fails
      return answer;
    }
  }

  /**
   * Generates vector embeddings for text that can be stored in the database
   * @param text - The text to generate embeddings for
   * @returns Vector embeddings with 768 dimensions
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text content cannot be empty');
      }

      const result = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
      });

      // Return embeddings with 768 dimensions
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }
  /**
   * Generates similar questions from a given question
   * @param question - The question to generate similar questions from
   * @returns Array of similar questions
   *
   * Note: This is a simple implementation for generating similar questions. In a real-world scenario, you might want to use a more sophisticated method like semantic search or transformer models.
   */

  async generateSimilarQuestions(
    question: string,
  ): Promise<{ questions: string[] }> {
    try {
      const result = await this.questionGeneratorModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        },
      });

      const response = result.response;
      return extractJsonFromText(response.text());
    } catch (error) {
      console.error('Error generating similar questions:', error);
      throw new Error('Failed to generate similar questions');
    }
  }

  /**
   * Comprehensive method to process a FAQ item - enhances the answer and generates embeddings
   * @param question - The FAQ question
   * @param answer - The original FAQ answer
   * @returns Object containing enhanced answer and embeddings
   */
  async processFaqItem(
    question: string,
    answer: string,
  ): Promise<{
    enhancedAnswer: string;
    questionEmbedding: number[];
    answerEmbedding: number[];
  }> {
    try {
      // Process in parallel for efficiency
      const [enhancedAnswer, questionEmbedding, answerEmbedding] =
        await Promise.all([
          this.enhanceAnswer(question, answer),
          this.generateEmbeddings(question),
          this.generateEmbeddings(answer),
        ]);

      return {
        enhancedAnswer,
        questionEmbedding,
        answerEmbedding,
      };
    } catch (error) {
      console.error('Error processing FAQ item:', error);
      throw error;
    }
  }
}
