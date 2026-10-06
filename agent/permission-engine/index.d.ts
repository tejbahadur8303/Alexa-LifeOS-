import type { PermissionLevel } from '../../mcp-server/src/models/types.js';
export declare class PermissionEngine {
    private lowRiskActions;
    private mediumRiskActions;
    private highRiskActions;
    classifyActionRisk(actionType: string): PermissionLevel;
    requiresUserApproval(actionType: string): boolean;
    evaluateExecutionPermission(actionType: string, isApproved?: boolean): {
        allowed: boolean;
        level: PermissionLevel;
        reason: string;
    };
}
export declare const permissionEngine: PermissionEngine;
