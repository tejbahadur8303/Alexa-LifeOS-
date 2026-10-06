import { describe, it, expect } from 'vitest';
import { permissionEngine } from '../../../agent/permission-engine/index.js';

describe('Consequence-Aware Permission Engine', () => {
  it('automatically permits low-risk queries without approval', () => {
    const lowRiskActions = [
      'get_travel_status',
      'calculate_eta',
      'read_calendar',
      'get_weather',
      'analyze_goal_risk',
    ];

    for (const act of lowRiskActions) {
      expect(permissionEngine.classifyActionRisk(act)).toBe('LOW');
      expect(permissionEngine.requiresUserApproval(act)).toBe(false);
      const evalResult = permissionEngine.evaluateExecutionPermission(act);
      expect(evalResult.allowed).toBe(true);
    }
  });

  it('blocks medium-risk actions like sending messages unless approved', () => {
    expect(permissionEngine.classifyActionRisk('send_message')).toBe('MEDIUM');
    expect(permissionEngine.requiresUserApproval('send_message')).toBe(true);

    const unapproved = permissionEngine.evaluateExecutionPermission('send_message', false);
    expect(unapproved.allowed).toBe(false);
    expect(unapproved.reason).toContain('requires explicit user consent');

    const approved = permissionEngine.evaluateExecutionPermission('send_message', true);
    expect(approved.allowed).toBe(true);
  });

  it('classifies critical actions as HIGH risk requiring approval', () => {
    expect(permissionEngine.classifyActionRisk('cancel_booking')).toBe('HIGH');
    expect(permissionEngine.requiresUserApproval('delete_important_data')).toBe(true);
  });
});
