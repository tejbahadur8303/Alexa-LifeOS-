import type { Goal, Task, TravelSnapshot, ItineraryRoute, RiskAnalysis, Approval } from '../../mcp-server/src/models/types.js';
export interface PlanActionProposal {
    actionType: string;
    title: string;
    description: string;
    impactSummary: string;
    consequenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    requiresApproval: boolean;
    payload: Record<string, any>;
}
export interface ReplanResult {
    replanRequired: boolean;
    replanReason?: string;
    proposals: PlanActionProposal[];
    summary: string;
}
export declare class Planner {
    /**
     * Evaluates the active goal state, context, and risks to determine if replanning is needed
     */
    evaluateReplanning(goal: Goal, travel: TravelSnapshot, tasks: Task[], risk: RiskAnalysis, alternativeRoute?: ItineraryRoute | null): ReplanResult;
    /**
     * Natural language command interpreter mapping user voice/text to agent actions
     */
    interpretNaturalLanguage(command: string, context: {
        goal?: Goal | null;
        risk?: RiskAnalysis | null;
        travel?: TravelSnapshot | null;
        pendingApprovals?: Approval[];
    }): {
        intent: string;
        suggestedTool: string;
        response: string;
        actionPayload?: any;
    };
}
export declare const planner: Planner;
