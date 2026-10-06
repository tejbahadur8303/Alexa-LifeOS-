import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../db/storage.js';

export const memoryTools = [
  {
    name: 'save_memory',
    description: `Purpose: Stores structured long-term memory such as user preferences, teammate relationships, or venue facts.
When to use: Call when learning a persistent fact about the user or operational constraints.
Permission requirements: LOW risk.`,
    parameters: z.object({
      userId: z.string().optional(),
      memoryType: z.enum(['preference', 'relationship', 'fact', 'constraint']),
      key: z.string().describe('Identifier key, e.g. "arrival_buffer_preference"'),
      value: z.any().describe('Structured JSON value to persist'),
      confidence: z.number().optional().describe('Confidence between 0.0 and 1.0'),
    }),
    handler: async (args: any) => {
      try {
        const mem = await storage.saveMemory({
          id: `mem_${uuidv4().slice(0, 8)}`,
          userId: args.userId || 'usr_alex_001',
          memoryType: args.memoryType,
          key: args.key,
          value: args.value,
          confidence: args.confidence ?? 1.0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return { success: true, data: mem };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'SAVE_MEMORY_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
  {
    name: 'search_memory',
    description: `Purpose: Queries the agent's long-term structured memory store for preferences, constraints, and relationships.
When to use: Call when needing context on user habits, preferred arrival buffer, or team contacts.
Permission requirements: LOW risk.`,
    parameters: z.object({
      query: z.string().describe('Search keyword or key prefix'),
      userId: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const all = await storage.getMemories(args.userId || 'usr_alex_001');
        const q = args.query.toLowerCase();
        const matches = all.filter(
          (m) =>
            m.key.toLowerCase().includes(q) ||
            JSON.stringify(m.value).toLowerCase().includes(q) ||
            m.memoryType.toLowerCase().includes(q)
        );
        return { success: true, data: matches };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'SEARCH_MEMORY_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_user_preferences',
    description: `Purpose: Returns user operational preferences including arrival buffer minutes, preferred transport, and alert thresholds.
When to use: Use when evaluating risk margins against user tolerance.
Permission requirements: LOW risk.`,
    parameters: z.object({
      userId: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const user = await storage.getUser(args.userId || 'usr_alex_001');
        const memories = await storage.getMemories(args.userId || 'usr_alex_001');
        const preferences = memories.filter((m) => m.memoryType === 'preference');
        return {
          success: true,
          data: {
            user,
            storedPreferences: preferences,
          },
        };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'GET_PREFERENCES_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
];
