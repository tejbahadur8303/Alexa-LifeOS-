import { storage } from '../db/storage.js';

export const userResources = [
  {
    uri: 'mcp://guardian/user/preferences',
    name: 'User Operational Preferences',
    mimeType: 'application/json',
    description: 'Current user profile preferences including preferred buffer minutes and transport modes.',
    handler: async () => {
      const user = await storage.getUser('usr_alex_001');
      const memories = await storage.getMemories('usr_alex_001');
      return {
        user,
        preferences: memories.filter((m) => m.memoryType === 'preference'),
      };
    },
  },
];
