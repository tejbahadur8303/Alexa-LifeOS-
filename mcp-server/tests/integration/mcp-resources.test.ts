import { describe, it, expect, beforeAll } from 'vitest';
import { storage } from '../../src/db/storage.js';
import { allResources } from '../../src/resources/index.js';

describe('MCP Resources Integration Tests', () => {
  beforeAll(async () => {
    process.env.FORCE_MEMORY_DB = 'true';
    await storage.init();
  });

  function getResource(uri: string) {
    const r: any = allResources.find((item: any) => item.uri === uri);
    if (!r) throw new Error(`Resource ${uri} not found`);
    return r;
  }

  it('reads mcp://guardian/user/preferences', async () => {
    const res = getResource('mcp://guardian/user/preferences');
    const data: any = await res.handler('mcp://guardian/user/preferences');
    expect(data.user).toBeDefined();
    expect(data.user.name).toBe('Alex');
    expect(data.preferences.length).toBeGreaterThan(0);
  });

  it('reads mcp://guardian/goals/active', async () => {
    const res = getResource('mcp://guardian/goals/active');
    const data: any = await res.handler('mcp://guardian/goals/active');
    expect(data.goal).toBeDefined();
    expect(data.goal.title).toContain('Hackathon');
    expect(data.health.healthScore).toBeGreaterThan(0);
  });

  it('reads mcp://guardian/trip/current', async () => {
    const res = getResource('mcp://guardian/trip/current');
    const data: any = await res.handler('mcp://guardian/trip/current');
    expect(data.etaMinutes).toBeDefined();
    expect(data.trafficStatus).toBeDefined();
  });
});
