import { describe, it, expect } from 'vitest';
import { dependencyEngine } from '../../../agent/dependency-engine/index.js';
import type { Task } from '../../src/models/types.js';

describe('Dependency Engine', () => {
  const sampleTasks: Task[] = [
    {
      id: 'task_deploy',
      goalId: 'goal_001',
      title: 'Deploy backend',
      description: '',
      assignee: 'Rahul',
      status: 'incomplete',
      isCritical: true,
      dependencies: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task_api_test',
      goalId: 'goal_001',
      title: 'Test API',
      description: '',
      assignee: 'Aman',
      status: 'incomplete',
      isCritical: false,
      dependencies: ['task_deploy'],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task_demo_test',
      goalId: 'goal_001',
      title: 'Test Demo',
      description: '',
      assignee: 'Alex',
      status: 'blocked',
      isCritical: true,
      dependencies: ['task_api_test'],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task_slides',
      goalId: 'goal_001',
      title: 'Presentation Slides',
      description: '',
      assignee: 'Priya',
      status: 'complete',
      isCritical: true,
      dependencies: [],
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('correctly identifies blocked tasks when prerequisites are incomplete', () => {
    const analysis = dependencyEngine.analyzeDependencies(sampleTasks);
    expect(analysis.blockedTasks.length).toBeGreaterThanOrEqual(1);

    const apiTestBlocker = analysis.blockers.find((b) => b.taskId === 'task_api_test');
    expect(apiTestBlocker).toBeDefined();
    expect(apiTestBlocker?.blockedByTaskId).toBe('task_deploy');
  });

  it('calculates the downstream impact of an uncompleted task', () => {
    const impact = dependencyEngine.calculateTaskImpact('task_deploy', sampleTasks);
    expect(impact.impactedTaskIds).toContain('task_api_test');
    expect(impact.impactSummary).toContain('Deploy backend');
  });
});
