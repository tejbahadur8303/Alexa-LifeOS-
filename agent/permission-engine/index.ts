import type { PermissionLevel } from '../../mcp-server/src/models/types.js';

export class PermissionEngine {
  private lowRiskActions = new Set([
    'calculate_eta',
    'get_eta',
    'get_route',
    'get_travel_status',
    'create_internal_task',
    'analyze_goal_risk',
    'save_memory',
    'search_memory',
    'get_user_preferences',
    'create_checklist',
    'read_calendar',
    'get_calendar_events',
    'get_event_details',
    'read_weather',
    'get_weather',
    'get_weather_forecast',
    'get_tasks',
    'get_task_dependencies',
    'get_blockers',
    'get_team_status',
    'detect_context_changes',
    'calculate_goal_impact',
    'get_goal_status',
  ]);

  private mediumRiskActions = new Set([
    'send_message',
    'modify_itinerary',
    'switch_route',
    'update_goal',
    'update_task',
    'change_reminder',
    'share_information',
    'replan_goal',
  ]);

  private highRiskActions = new Set([
    'purchase_something',
    'cancel_booking',
    'make_financial_transaction',
    'delete_important_data',
    'delete_goal',
    'cancel_goal',
  ]);

  classifyActionRisk(actionType: string): PermissionLevel {
    const normalized = actionType.toLowerCase().trim();
    if (this.highRiskActions.has(normalized)) return 'HIGH';
    if (this.mediumRiskActions.has(normalized)) return 'MEDIUM';
    if (this.lowRiskActions.has(normalized)) return 'LOW';

    // Default conservative rule: unknown actions default to MEDIUM risk
    return 'MEDIUM';
  }

  requiresUserApproval(actionType: string): boolean {
    const level = this.classifyActionRisk(actionType);
    return level === 'MEDIUM' || level === 'HIGH';
  }

  evaluateExecutionPermission(
    actionType: string,
    isApproved = false
  ): {
    allowed: boolean;
    level: PermissionLevel;
    reason: string;
  } {
    const level = this.classifyActionRisk(actionType);

    if (level === 'LOW') {
      return {
        allowed: true,
        level: 'LOW',
        reason: 'Low-risk operational action automatically permitted by Guardian autonomy policy.',
      };
    }

    if (isApproved) {
      return {
        allowed: true,
        level,
        reason: `Explicit user approval verified for ${level}-risk action "${actionType}".`,
      };
    }

    return {
      allowed: false,
      level,
      reason: `Action "${actionType}" is classified as ${level} risk and requires explicit user consent before execution.`,
    };
  }
}

export const permissionEngine = new PermissionEngine();
