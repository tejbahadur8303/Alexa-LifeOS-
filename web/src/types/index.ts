export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string;
  targetLocation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'at_risk' | 'blocked' | 'completed' | 'failed' | 'cancelled';
  successCriteria: string[];
  progress: number;
  nextAction?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  assignee: string;
  status: 'incomplete' | 'in_progress' | 'complete' | 'blocked';
  isCritical: boolean;
  deadline?: string;
  dependencies: string[];
  blockedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAnalysis {
  id: string;
  goalId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  reasons: string[];
  affectedGoals: string[];
  recommendedActions: string[];
  evaluatedAt: string;
}

export interface TravelSnapshot {
  etaMinutes: number;
  departureTime: string;
  arrivalTime: string;
  currentBufferMinutes: number;
  routeName: string;
  trafficStatus: 'normal' | 'moderate' | 'heavy' | 'severe';
  distanceKm: number;
}

export interface ContextSnapshot {
  id: string;
  goalId: string;
  timestamp: string;
  travel: TravelSnapshot;
  weather: {
    condition: string;
    temperatureC: number;
    rainProbabilityPercent: number;
    windSpeedKmh: number;
    advisory?: string | null;
  };
  team: {
    total: number;
    ready: number;
    blocked: number;
  };
  tasks: {
    total: number;
    completed: number;
    blocked: number;
  };
}

export interface ContextChange {
  category: 'travel' | 'weather' | 'tasks' | 'team' | 'schedule';
  field: string;
  previousValue: any;
  currentValue: any;
  deltaSummary: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedGoalId: string;
  recommendedAction: string;
}

export interface Approval {
  id: string;
  goalId: string;
  actionId: string;
  actionType: string;
  title: string;
  description: string;
  impactSummary: string;
  consequenceLevel: 'MEDIUM' | 'HIGH';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  payload: Record<string, any>;
}

export interface ActionLog {
  id: string;
  requestId: string;
  goalId: string;
  toolName: string;
  actionType: string;
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'verified' | 'failed' | 'rejected';
  riskClassification: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresApproval: boolean;
  approvalId?: string;
  result?: any;
  verified: boolean;
  latencyMs: number;
  timestamp: string;
  explanation: string;
}

export interface GoalStatusResponse {
  goal: Goal;
  health: {
    healthScore: number;
    status: string;
    criteriaStatus: Record<string, { met: boolean; summary: string }>;
    explanation: string;
  };
  risk: RiskAnalysis;
  travel: TravelSnapshot;
  tasks: {
    total: number;
    completed: number;
    blocked: number;
    items: Task[];
  };
  team: {
    total: number;
    ready: number;
    members: Array<{
      id: string;
      name: string;
      role: string;
      status: string;
      assignedDeliverable: string;
      handle: string;
    }>;
  };
}
