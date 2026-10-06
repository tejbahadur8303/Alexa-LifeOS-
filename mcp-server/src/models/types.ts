export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type GoalStatus =
  | 'draft'
  | 'active'
  | 'at_risk'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskStatus = 'incomplete' | 'in_progress' | 'complete' | 'blocked';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PermissionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ActionStatus =
  | 'pending'
  | 'executing'
  | 'verified'
  | 'failed'
  | 'rejected';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  preferredBufferMinutes: number;
  preferredLanguage: string;
  preferredTransport: string;
  homeLocation: string;
  activeGoalId?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string;
  targetLocation: string;
  priority: PriorityLevel;
  status: GoalStatus;
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
  status: TaskStatus;
  isCritical: boolean;
  deadline?: string;
  dependencies: string[];
  blockedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  isCrucial: boolean;
  createdAt: string;
}

export interface RiskAnalysis {
  id: string;
  goalId: string;
  riskLevel: RiskLevel;
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

export interface WeatherSnapshot {
  condition: string;
  temperatureC: number;
  rainProbabilityPercent: number;
  windSpeedKmh: number;
  advisory?: string | null;
}

export interface ContextSnapshot {
  id: string;
  goalId: string;
  timestamp: string;
  travel: TravelSnapshot;
  weather: WeatherSnapshot;
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

export interface ActionLog {
  id: string;
  requestId: string;
  goalId: string;
  toolName: string;
  actionType: string;
  parameters: Record<string, any>;
  status: ActionStatus;
  riskClassification: PermissionLevel;
  requiresApproval: boolean;
  approvalId?: string;
  result?: any;
  verified: boolean;
  latencyMs: number;
  timestamp: string;
  explanation: string;
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
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  payload: Record<string, any>;
}

export interface Memory {
  id: string;
  userId: string;
  memoryType: 'preference' | 'relationship' | 'fact' | 'constraint';
  key: string;
  value: any;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'ready' | 'incomplete' | 'blocked';
  assignedDeliverable: string;
  contact: string;
  handle: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'action_required';
  read: boolean;
  createdAt: string;
}

export interface ItineraryRoute {
  id: string;
  goalId: string;
  routeName: string;
  mode: 'transit' | 'driving' | 'express_rail' | 'rideshare';
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  steps: string[];
  isAlternative: boolean;
  isSelected: boolean;
}
