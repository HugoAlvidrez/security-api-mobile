import { StressAnalysis } from '../types/index.js';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

export class StressAnalysisService {
  // Mock implementation of stress analysis
  // In production, this would integrate with OpenAI Whisper API
  async analyzeAudio(
    eventId: string,
    userId: string,
    audioUrl: string
  ): Promise<StressAnalysis> {
    const client = await pool.connect();

    try {
      // Simulate AI analysis
      // In production, call OpenAI Whisper API
      const mockStressLevel = Math.floor(Math.random() * 100);
      const mockConfidence = 75 + Math.floor(Math.random() * 25);

      const analysis: StressAnalysis = {
        id: uuidv4(),
        eventId,
        userId,
        audioUrl,
        stressLevel: mockStressLevel,
        confidence: mockConfidence,
        voiceCharacteristics: {
          pitch: 120 + Math.random() * 80,
          intensity: 60 + Math.random() * 40,
          frequency: 200 + Math.random() * 200,
        },
        analyzedAt: new Date(),
        createdAt: new Date(),
      };

      // Save analysis to database
      await client.query(
        `INSERT INTO "stress_analyses" (id, "eventId", "userId", "audioUrl", "stressLevel", confidence, "analyzedAt", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          analysis.id,
          eventId,
          userId,
          audioUrl,
          analysis.stressLevel,
          analysis.confidence,
          analysis.analyzedAt,
          analysis.createdAt,
        ]
      );

      logger.info('Stress analysis completed', {
        analysisId: analysis.id,
        stressLevel: analysis.stressLevel,
      });

      return analysis;
    } finally {
      client.release();
    }
  }

  async getAnalysisHistory(userId: string, eventId?: string): Promise<StressAnalysis[]> {
    const client = await pool.connect();

    try {
      let query = 'SELECT * FROM "stress_analyses" WHERE "userId" = $1';
      const params: any[] = [userId];

      if (eventId) {
        query += ' AND "eventId" = $2';
        params.push(eventId);
      }

      query += ' ORDER BY "createdAt" DESC';

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getLatestAnalysis(eventId: string): Promise<StressAnalysis | null> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT * FROM "stress_analyses" WHERE "eventId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [eventId]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }
}

export const stressAnalysisService = new StressAnalysisService();
