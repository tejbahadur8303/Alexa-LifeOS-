import type { Goal, GoalStatus, Task, TravelSnapshot, TeamMember, RiskAnalysis } from '../../mcp-server/src/models/types.js';
export interface GoalHealthEvaluation {
    healthScore: number;
    status: GoalStatus;
    criteriaStatus: Record<string, {
        met: boolean;
        summary: string;
    }>;
    explanation: string;
}
export declare class GoalEngine {
    evaluateGoal(goal: Goal, tasks: Task[], travel: TravelSnapshot, teamMembers: TeamMember[], risk: RiskAnalysis): GoalHealthEvaluation;
}
export declare const goalEngine: GoalEngine;
