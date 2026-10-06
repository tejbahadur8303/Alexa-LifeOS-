import { z } from 'zod';
import { permissionService } from '../services/permission.service.js';

export const approvalTools = [
  {
    name: 'request_action_approval',
    description: `Purpose: Queues a consequential action (e.g. messaging team, switching routes, modifying bookings) for explicit user review and permission.
When to use: Use whenever the planner wants to execute a medium or high consequence mitigation.
Permission requirements: LOW risk (Creating the approval request).`,
    parameters: z.object({
      goalId: z.string(),
      actionType: z.string().describe('Type of action, e.g. "switch_route" or "send_message"'),
      title: z.string().describe('Short human-readable title for the prompt'),
      description: z.string().describe('Details of proposed action'),
      impactSummary: z.string().describe('Clear explanation of what happens and why it is necessary'),
      payload: z.record(z.any()).describe('Execution payload for the action'),
    }),
    handler: async (args: any) => {
      try {
        const approval = await permissionService.requestApproval(args);
        return { success: true, data: approval };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'REQUEST_APPROVAL_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
  {
    name: 'get_pending_approvals',
    description: `Purpose: Returns all actions currently awaiting user authorization.
When to use: Call to check if any actions are blocked waiting for user sign-off.
Permission requirements: LOW risk.`,
    parameters: z.object({}),
    handler: async () => {
      try {
        const approvals = await permissionService.getPendingApprovals();
        return { success: true, data: approvals };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'GET_APPROVALS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'resolve_approval',
    description: `Purpose: Grants or rejects authorization for a pending action and immediately executes and verifies the action if approved.
When to use: Call when the user responds "Yes", "Approve", "Take the alternative", or "Reject".
Permission requirements: USER-DRIVEN (Executes consequential action upon user decision).`,
    parameters: z.object({
      approvalId: z.string().describe('ID of approval item'),
      decision: z.enum(['approved', 'rejected']),
      resolvedBy: z.string().optional().describe('Name of authorizer, defaults to "Alex"'),
    }),
    handler: async (args: any) => {
      try {
        const result = await permissionService.resolveApproval(
          args.approvalId,
          args.decision,
          args.resolvedBy || 'Alex'
        );
        return { success: true, data: result };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'RESOLVE_APPROVAL_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
];
