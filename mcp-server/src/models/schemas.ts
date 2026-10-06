import mongoose, { Schema } from 'mongoose';
import type {
  User,
  Goal,
  Task,
  CalendarEvent,
  RiskAnalysis,
  ContextSnapshot,
  ActionLog,
  Approval,
  Memory,
  TeamMember,
  NotificationItem,
  ItineraryRoute,
} from './types.js';

export const UserSchema = new Schema<User>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  preferredBufferMinutes: { type: Number, default: 30 },
  preferredLanguage: { type: String, default: 'English' },
  preferredTransport: { type: String, default: 'transit' },
  homeLocation: { type: String, required: true },
  activeGoalId: { type: String, index: true },
  createdAt: { type: String, required: true },
});

export const GoalSchema = new Schema<Goal>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: String, required: true, index: true },
  targetLocation: { type: String, required: true },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: String, required: true, index: true },
  successCriteria: [{ type: String }],
  progress: { type: Number, default: 0 },
  nextAction: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});
GoalSchema.index({ status: 1, deadline: 1 });

export const TaskSchema = new Schema<Task>({
  id: { type: String, required: true, unique: true, index: true },
  goalId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignee: { type: String, required: true },
  status: { type: String, required: true, index: true },
  isCritical: { type: Boolean, default: false },
  deadline: { type: String },
  dependencies: [{ type: String }],
  blockedReason: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const EventSchema = new Schema<CalendarEvent>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: String, required: true, index: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  isCrucial: { type: Boolean, default: false },
  createdAt: { type: String, required: true },
});

export const RiskSchema = new Schema<RiskAnalysis>({
  id: { type: String, required: true, unique: true, index: true },
  goalId: { type: String, required: true, index: true },
  riskLevel: { type: String, required: true, index: true },
  riskScore: { type: Number, required: true },
  reasons: [{ type: String }],
  affectedGoals: [{ type: String }],
  recommendedActions: [{ type: String }],
  evaluatedAt: { type: String, required: true, index: true },
});

export const ContextSnapshotSchema = new Schema<ContextSnapshot>({
  id: { type: String, required: true, unique: true, index: true },
  goalId: { type: String, required: true, index: true },
  timestamp: { type: String, required: true, index: true },
  travel: { type: Schema.Types.Mixed, required: true },
  weather: { type: Schema.Types.Mixed, required: true },
  team: { type: Schema.Types.Mixed, required: true },
  tasks: { type: Schema.Types.Mixed, required: true },
});

export const ActionSchema = new Schema<ActionLog>({
  id: { type: String, required: true, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  goalId: { type: String, required: true, index: true },
  toolName: { type: String, required: true },
  actionType: { type: String, required: true },
  parameters: { type: Schema.Types.Mixed },
  status: { type: String, required: true, index: true },
  riskClassification: { type: String, required: true },
  requiresApproval: { type: Boolean, default: false },
  approvalId: { type: String, index: true },
  result: { type: Schema.Types.Mixed },
  verified: { type: Boolean, default: false },
  latencyMs: { type: Number, default: 0 },
  timestamp: { type: String, required: true, index: true },
  explanation: { type: String, required: true },
});

export const ApprovalSchema = new Schema<Approval>({
  id: { type: String, required: true, unique: true, index: true },
  goalId: { type: String, required: true, index: true },
  actionId: { type: String, required: true, index: true },
  actionType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  impactSummary: { type: String, required: true },
  consequenceLevel: { type: String, required: true },
  status: { type: String, required: true, index: true },
  requestedAt: { type: String, required: true, index: true },
  resolvedAt: { type: String },
  resolvedBy: { type: String },
  payload: { type: Schema.Types.Mixed, required: true },
});

export const MemorySchema = new Schema<Memory>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  memoryType: { type: String, required: true },
  key: { type: String, required: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  confidence: { type: Number, default: 1.0 },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const TeamMemberSchema = new Schema<TeamMember>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
  assignedDeliverable: { type: String, required: true },
  contact: { type: String, required: true },
  handle: { type: String, required: true },
  notes: { type: String },
});

export const NotificationSchema = new Schema<NotificationItem>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: String, required: true, index: true },
});

export const ItinerarySchema = new Schema<ItineraryRoute>({
  id: { type: String, required: true, unique: true, index: true },
  goalId: { type: String, required: true, index: true },
  routeName: { type: String, required: true },
  mode: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  bufferMinutes: { type: Number, required: true },
  steps: [{ type: String }],
  isAlternative: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
});

export const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema);
export const GoalModel = mongoose.models.Goal || mongoose.model<Goal>('Goal', GoalSchema);
export const TaskModel = mongoose.models.Task || mongoose.model<Task>('Task', TaskSchema);
export const EventModel = mongoose.models.Event || mongoose.model<CalendarEvent>('Event', EventSchema);
export const RiskModel = mongoose.models.Risk || mongoose.model<RiskAnalysis>('Risk', RiskSchema);
export const ContextSnapshotModel = mongoose.models.ContextSnapshot || mongoose.model<ContextSnapshot>('ContextSnapshot', ContextSnapshotSchema);
export const ActionModel = mongoose.models.Action || mongoose.model<ActionLog>('Action', ActionSchema);
export const ApprovalModel = mongoose.models.Approval || mongoose.model<Approval>('Approval', ApprovalSchema);
export const MemoryModel = mongoose.models.Memory || mongoose.model<Memory>('Memory', MemorySchema);
export const TeamMemberModel = mongoose.models.TeamMember || mongoose.model<TeamMember>('TeamMember', TeamMemberSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<NotificationItem>('Notification', NotificationSchema);
export const ItineraryModel = mongoose.models.Itinerary || mongoose.model<ItineraryRoute>('Itinerary', ItinerarySchema);
