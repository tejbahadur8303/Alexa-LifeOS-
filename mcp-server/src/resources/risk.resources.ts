import { riskService } from '../services/risk.service.js';
import { goalService } from '../services/goal.service.js';
import { storage } from '../db/storage.js';
import { permissionService } from '../services/permission.service.js';

export const riskResources = [
  {
    uri: 'mcp://guardian/risks/current',
    name: 'Current Goal Risk Assessment',
    mimeType: 'application/json',
    description: 'Current deterministic risk score, level, explainable reasons, and mitigations.',
    handler: async () => {
      const activeGoal = await goalService.getActiveGoal();
      if (!activeGoal) return { riskLevel: 'LOW', riskScore: 0, reasons: [] };
      return riskService.analyzeGoalRisk(activeGoal.id);
    },
  },
  {
    uri: 'mcp://guardian/tasks/today',
    name: "Today's Task Plan",
    mimeType: 'application/json',
    description: 'All tasks scheduled for the active goal, with blocker states and assignees.',
    handler: async () => {
      const activeGoal = await goalService.getActiveGoal();
      return storage.getTasksByGoal(activeGoal ? activeGoal.id : 'goal_hackathon_001');
    },
  },
  {
    uri: 'mcp://guardian/team/current',
    name: 'Team Readiness State',
    mimeType: 'application/json',
    description: 'Collaborator deliverables and completion states.',
    handler: async () => {
      return storage.getTeamMembers();
    },
  },
  {
    uri: 'mcp://guardian/approvals/pending',
    name: 'Pending Consequential Approvals',
    mimeType: 'application/json',
    description: 'Actions requiring user authorization before autonomous execution.',
    handler: async () => {
      return permissionService.getPendingApprovals();
    },
  },
];
