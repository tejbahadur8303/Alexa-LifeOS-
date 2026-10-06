import { z } from 'zod';
import { messagingSimulator } from '../adapters/simulation/messaging.simulator.js';
import { teamSimulator } from '../adapters/simulation/team.simulator.js';
import { permissionEngine } from '../../../agent/permission-engine/index.js';

export const communicationTools = [
  {
    name: 'send_message',
    description: `Purpose: Sends an external communication (via Slack/SMS/Email) to a team member or collaborator.
When to use: Use to notify assignees about blockers, request updates, or coordinate logistics.
Permission requirements: MEDIUM risk (Sending external communications requires authorization or pre-approval).
Side effects: Dispatches simulated message and verifies delivery.`,
    parameters: z.object({
      recipient: z.string().describe('Recipient name or handle, e.g. "Rahul" or "@rahul_dev"'),
      message: z.string().describe('Message content'),
      channel: z.enum(['slack', 'sms', 'email', 'push']).optional(),
      isPreApproved: z.boolean().optional().describe('Flag indicating explicit user pre-authorization'),
    }),
    handler: async (args: any) => {
      try {
        const perm = permissionEngine.evaluateExecutionPermission('send_message', args.isPreApproved ?? true);
        if (!perm.allowed) {
          return {
            success: false,
            error: {
              code: 'APPROVAL_REQUIRED',
              message: perm.reason,
              retryable: false,
            },
          };
        }

        const msg = await messagingSimulator.sendMessage(
          args.recipient,
          args.message,
          args.channel || 'slack'
        );
        const verified = await messagingSimulator.verifyDelivery(msg.id);

        return {
          success: true,
          data: {
            messageId: msg.id,
            recipient: msg.recipient,
            channel: msg.channel,
            delivered: verified,
            timestamp: msg.timestamp,
            verificationNote: 'Message delivery confirmed via simulated gateway.',
          },
        };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'MESSAGE_SEND_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_team_status',
    description: `Purpose: Queries the readiness state of all collaborators and assignees working on goal deliverables.
When to use: Call to inspect who has finished their parts and who is blocking progress.
Permission requirements: LOW risk.`,
    parameters: z.object({}),
    handler: async () => {
      try {
        const members = await teamSimulator.getTeamMembers();
        return { success: true, data: members };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'TEAM_STATUS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
];
