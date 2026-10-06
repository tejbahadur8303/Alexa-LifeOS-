import type { Goal, Task, TravelSnapshot, WeatherSnapshot, TeamMember, RiskAnalysis } from '../../mcp-server/src/models/types.js';
export interface RiskEvaluationInput {
    goal: Goal;
    tasks: Task[];
    travel: TravelSnapshot;
    weather?: WeatherSnapshot;
    teamMembers: TeamMember[];
}
export declare class RiskEngine {
    evaluateRisk(input: RiskEvaluationInput): RiskAnalysis;
    explainDecision(risk: RiskAnalysis, goal: Goal, travel: TravelSnapshot): string;
}
export declare const riskEngine: RiskEngine;
