import { v4 as uuidv4 } from 'uuid';
import type { Approval, ActionLog } from '../models/types.js';
import { storage } from '../db/storage.js';
import { permissionEngine } from '../../../agent/permission-engine/index.js';
import { messagingSimulator } from '../adapters/simulation/messaging.simulator.js';
import { travelSimulator } from '../adapters/simulation/travel.simulator.js';

export class PermissionService {
  async requestApproval(data: {
    goalId: string;
    actionType: string;
    title: string;
    description: string;
    impactSummary: string;
    payload: Record<string, any>;
  }): Promise<Approval> {
    const level = permissionEngine.classifyActionRisk(data.actionType);
    const consequenceLevel = level === 'HIGH' ? 'HIGH' : 'MEDIUM';

    // Check if an identical pending approval already exists (idempotency)
    const existing = await storage.getApprovals();
    const duplicate = existing.find(
      (a) =>
        a.goalId === data.goalId &&
        a.actionType === data.actionType &&
        a.status === 'pending'
    );
    if (duplicate) {
      return duplicate;
    }

    const actionId = `act_${uuidv4().slice(0, 8)}`;
    const approval: Approval = {
      id: `appr_${uuidv4().slice(0, 8)}`,
      goalId: data.goalId,
      actionId,
      actionType: data.actionType,
      title: data.title,
      description: data.description,
      impactSummary: data.impactSummary,
      consequenceLevel,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      payload: data.payload,
    };

    await storage.saveApproval(approval);

    // Log the approval request as an action
    await storage.logAction({
      id: actionId,
      requestId: `req_${uuidv4().slice(0, 8)}`,
      goalId: data.goalId,
      toolName: data.actionType,
      actionType: data.actionType,
      parameters: data.payload,
      status: 'pending',
      riskClassification: consequenceLevel,
      requiresApproval: true,
      approvalId: approval.id,
      verified: false,
      latencyMs: 12,
      timestamp: new Date().toISOString(),
      explanation: `Action "${data.title}" paused pending user authorization (${consequenceLevel} consequence level).`,
    });

    return approval;
  }

  async getPendingApprovals(): Promise<Approval[]> {
    const approvals = await storage.getApprovals();
    return approvals.filter((a) => a.status === 'pending');
  }

  async resolveApproval(
    approvalId: string,
    decision: 'approved' | 'rejected',
    resolvedBy = 'Alex'
  ): Promise<{
    approval: Approval;
    executionResult?: any;
    verified: boolean;
  }> {
    const approval = await storage.getApproval(approvalId);
    if (!approval) {
      throw new Error(`Approval with ID "${approvalId}" not found`);
    }

    approval.status = decision;
    approval.resolvedAt = new Date().toISOString();
    approval.resolvedBy = resolvedBy;
    await storage.saveApproval(approval);

    if (decision === 'rejected') {
      await storage.logAction({
        id: `act_${uuidv4().slice(0, 8)}`,
        requestId: `req_${uuidv4().slice(0, 8)}`,
        goalId: approval.goalId,
        toolName: approval.actionType,
        actionType: approval.actionType,
        parameters: approval.payload,
        status: 'rejected',
        riskClassification: approval.consequenceLevel,
        requiresApproval: true,
        approvalId: approval.id,
        verified: true,
        latencyMs: 8,
        timestamp: new Date().toISOString(),
        explanation: `User explicitly rejected action "${approval.title}". Plan preserved.`,
      });

      return { approval, verified: true };
    }

    // Execute the approved action with verification
    let executionResult: any = null;
    let verified = false;

    if (approval.actionType === 'switch_route') {
      const altRoute = await travelSimulator.findAlternativeRoute(approval.goalId);
      await travelSimulator.applyAlternativeRoute(altRoute);
      await storage.saveItinerary({
        ...altRoute,
        isSelected: true,
      });
      executionResult = {
        appliedRoute: altRoute.routeName,
        newEtaMinutes: altRoute.durationMinutes,
        newArrivalTime: altRoute.arrivalTime,
        newBufferMinutes: altRoute.bufferMinutes,
      };
      verified = true;
    } else if (approval.actionType === 'send_message') {
      const sent = await messagingSimulator.sendMessage(
        approval.payload.recipient || 'Rahul',
        approval.payload.message || 'Urgent blocker update required for Hackathon demo.',
        approval.payload.channel || 'slack'
      );
      verified = await messagingSimulator.verifyDelivery(sent.id);
      executionResult = {
        messageId: sent.id,
        recipient: sent.recipient,
        delivered: verified,
        deliveryTimestamp: sent.timestamp,
      };
    } else {
      executionResult = { status: 'executed_custom_action' };
      verified = true;
    }

    // Log verified execution
    await storage.logAction({
      id: `act_${uuidv4().slice(0, 8)}`,
      requestId: `req_${uuidv4().slice(0, 8)}`,
      goalId: approval.goalId,
      toolName: approval.actionType,
      actionType: approval.actionType,
      parameters: approval.payload,
      status: 'verified',
      riskClassification: approval.consequenceLevel,
      requiresApproval: true,
      approvalId: approval.id,
      result: executionResult,
      verified,
      latencyMs: 145,
      timestamp: new Date().toISOString(),
      explanation: `Action "${approval.title}" successfully approved, executed, and verified.`,
    });

    return { approval, executionResult, verified };
  }
}

export const permissionService = new PermissionService();
