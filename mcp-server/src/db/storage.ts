import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
} from '../models/types.js';
import {
  UserModel,
  GoalModel,
  TaskModel,
  EventModel,
  RiskModel,
  ContextSnapshotModel,
  ActionModel,
  ApprovalModel,
  MemoryModel,
  TeamMemberModel,
  NotificationModel,
  ItineraryModel,
} from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorageEngine {
  private isConnectedToMongo = false;

  // In-memory fallback / caching collections
  public users: Map<string, User> = new Map();
  public goals: Map<string, Goal> = new Map();
  public tasks: Map<string, Task> = new Map();
  public events: Map<string, CalendarEvent> = new Map();
  public risks: Map<string, RiskAnalysis> = new Map();
  public contextSnapshots: ContextSnapshot[] = [];
  public actions: ActionLog[] = [];
  public approvals: Map<string, Approval> = new Map();
  public memories: Map<string, Memory> = new Map();
  public teamMembers: Map<string, TeamMember> = new Map();
  public notifications: NotificationItem[] = [];
  public itineraries: Map<string, ItineraryRoute> = new Map();

  async init(mongoUri?: string): Promise<{ mongo: boolean }> {
    const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifeos';
    try {
      if (process.env.SIMULATION_MODE === 'true' && process.env.FORCE_MEMORY_DB === 'true') {
        console.log('[Storage] Forced In-Memory DB Mode');
        this.isConnectedToMongo = false;
      } else {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000,
        });
        this.isConnectedToMongo = true;
        console.log(`[Storage] Connected to MongoDB at ${uri}`);
      }
    } catch (err: any) {
      console.warn(`[Storage] MongoDB not reachable (${err.message || 'connection failed'}). Using resilient In-Memory Store.`);
      this.isConnectedToMongo = false;
    }

    await this.loadSeedData();
    return { mongo: this.isConnectedToMongo };
  }

  isMongo(): boolean {
    return this.isConnectedToMongo;
  }

  async loadSeedData(): Promise<void> {
    const seedDir = path.resolve(__dirname, '../../../database/seed');
    try {
      if (fs.existsSync(seedDir)) {
        const usersFile = path.join(seedDir, 'users.json');
        if (fs.existsSync(usersFile)) {
          const items: User[] = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
          for (const u of items) {
            this.users.set(u.id, u);
            if (this.isConnectedToMongo) {
              await UserModel.updateOne({ id: u.id }, { $set: u }, { upsert: true });
            }
          }
        }

        const goalsFile = path.join(seedDir, 'goals.json');
        if (fs.existsSync(goalsFile)) {
          const items: Goal[] = JSON.parse(fs.readFileSync(goalsFile, 'utf-8'));
          for (const g of items) {
            this.goals.set(g.id, g);
            if (this.isConnectedToMongo) {
              await GoalModel.updateOne({ id: g.id }, { $set: g }, { upsert: true });
            }
          }
        }

        const tasksFile = path.join(seedDir, 'tasks.json');
        if (fs.existsSync(tasksFile)) {
          const items: Task[] = JSON.parse(fs.readFileSync(tasksFile, 'utf-8'));
          for (const t of items) {
            this.tasks.set(t.id, t);
            if (this.isConnectedToMongo) {
              await TaskModel.updateOne({ id: t.id }, { $set: t }, { upsert: true });
            }
          }
        }

        const eventsFile = path.join(seedDir, 'events.json');
        if (fs.existsSync(eventsFile)) {
          const items: CalendarEvent[] = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
          for (const e of items) {
            this.events.set(e.id, e);
            if (this.isConnectedToMongo) {
              await EventModel.updateOne({ id: e.id }, { $set: e }, { upsert: true });
            }
          }
        }

        const teamFile = path.join(seedDir, 'team.json');
        if (fs.existsSync(teamFile)) {
          const items: TeamMember[] = JSON.parse(fs.readFileSync(teamFile, 'utf-8'));
          for (const tm of items) {
            this.teamMembers.set(tm.id, tm);
            if (this.isConnectedToMongo) {
              await TeamMemberModel.updateOne({ id: tm.id }, { $set: tm }, { upsert: true });
            }
          }
        }
      }
    } catch (e: any) {
      console.warn('[Storage] Error reading seed files:', e.message);
    }

    // Seed default structured memories
    const defaultMemories: Memory[] = [
      {
        id: 'mem_001',
        userId: 'usr_alex_001',
        memoryType: 'preference',
        key: 'arrival_buffer_preference',
        value: { minutes: 30, rationale: 'Prefers 30-minute arrival buffer for key presentations' },
        confidence: 0.95,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mem_002',
        userId: 'usr_alex_001',
        memoryType: 'relationship',
        key: 'teammate_backend_owner',
        value: { name: 'Rahul', role: 'Backend Lead', handle: '@rahul_dev', channel: 'Slack' },
        confidence: 1.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mem_003',
        userId: 'usr_alex_001',
        memoryType: 'fact',
        key: 'hackathon_location',
        value: { venue: 'Innovation Center Hall 4', address: 'Demo Venue - Innovation Center' },
        confidence: 1.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const mem of defaultMemories) {
      if (!this.memories.has(mem.id)) {
        this.memories.set(mem.id, mem);
        if (this.isConnectedToMongo) {
          await MemoryModel.updateOne({ id: mem.id }, { $set: mem }, { upsert: true });
        }
      }
    }

    // Seed default baseline itinerary
    const defaultItinerary: ItineraryRoute = {
      id: 'itin_001',
      goalId: 'goal_hackathon_001',
      routeName: 'Primary City Express Transit',
      mode: 'transit',
      departureTime: '2026-10-04T07:45:00.000Z',
      arrivalTime: '2026-10-04T08:30:00.000Z',
      durationMinutes: 45,
      bufferMinutes: 30,
      steps: [
        'Board Blue Line Metro at Central Station (07:45 AM)',
        'Transfer to Tech Line Shuttle at Innovation Blvd (08:15 AM)',
        'Arrive at Demo Venue Hall 4 (08:30 AM)'
      ],
      isAlternative: false,
      isSelected: true,
    };
    this.itineraries.set(defaultItinerary.id, defaultItinerary);
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    if (this.isConnectedToMongo) {
      const doc = await UserModel.findOne({ id }).lean();
      if (doc) return doc as unknown as User;
    }
    return this.users.get(id) || null;
  }

  // Goal operations
  async getGoal(id: string): Promise<Goal | null> {
    if (this.isConnectedToMongo) {
      const doc = await GoalModel.findOne({ id }).lean();
      if (doc) return doc as unknown as Goal;
    }
    return this.goals.get(id) || null;
  }

  async getAllGoals(): Promise<Goal[]> {
    if (this.isConnectedToMongo) {
      const docs = await GoalModel.find().sort({ deadline: 1 }).lean();
      if (docs.length > 0) return docs as unknown as Goal[];
    }
    return Array.from(this.goals.values());
  }

  async saveGoal(goal: Goal): Promise<Goal> {
    goal.updatedAt = new Date().toISOString();
    this.goals.set(goal.id, goal);
    if (this.isConnectedToMongo) {
      await GoalModel.updateOne({ id: goal.id }, { $set: goal }, { upsert: true });
    }
    return goal;
  }

  // Task operations
  async getTasksByGoal(goalId: string): Promise<Task[]> {
    if (this.isConnectedToMongo) {
      const docs = await TaskModel.find({ goalId }).lean();
      if (docs.length > 0) return docs as unknown as Task[];
    }
    return Array.from(this.tasks.values()).filter((t) => t.goalId === goalId);
  }

  async getTask(id: string): Promise<Task | null> {
    if (this.isConnectedToMongo) {
      const doc = await TaskModel.findOne({ id }).lean();
      if (doc) return doc as unknown as Task;
    }
    return this.tasks.get(id) || null;
  }

  async saveTask(task: Task): Promise<Task> {
    task.updatedAt = new Date().toISOString();
    this.tasks.set(task.id, task);
    if (this.isConnectedToMongo) {
      await TaskModel.updateOne({ id: task.id }, { $set: task }, { upsert: true });
    }
    return task;
  }

  // Risk operations
  async getLatestRisk(goalId: string): Promise<RiskAnalysis | null> {
    if (this.isConnectedToMongo) {
      const doc = await RiskModel.findOne({ goalId }).sort({ evaluatedAt: -1 }).lean();
      if (doc) return doc as unknown as RiskAnalysis;
    }
    return this.risks.get(goalId) || null;
  }

  async saveRisk(risk: RiskAnalysis): Promise<RiskAnalysis> {
    this.risks.set(risk.goalId, risk);
    if (this.isConnectedToMongo) {
      await RiskModel.updateOne({ id: risk.id }, { $set: risk }, { upsert: true });
    }
    return risk;
  }

  // Approval operations
  async getApprovals(): Promise<Approval[]> {
    if (this.isConnectedToMongo) {
      const docs = await ApprovalModel.find().sort({ requestedAt: -1 }).lean();
      if (docs.length > 0) return docs as unknown as Approval[];
    }
    return Array.from(this.approvals.values()).sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  async getApproval(id: string): Promise<Approval | null> {
    if (this.isConnectedToMongo) {
      const doc = await ApprovalModel.findOne({ id }).lean();
      if (doc) return doc as unknown as Approval;
    }
    return this.approvals.get(id) || null;
  }

  async saveApproval(approval: Approval): Promise<Approval> {
    this.approvals.set(approval.id, approval);
    if (this.isConnectedToMongo) {
      await ApprovalModel.updateOne({ id: approval.id }, { $set: approval }, { upsert: true });
    }
    return approval;
  }

  // Action / Audit logs
  async logAction(action: ActionLog): Promise<ActionLog> {
    this.actions.unshift(action);
    if (this.actions.length > 500) this.actions.pop();
    if (this.isConnectedToMongo) {
      await ActionModel.create(action);
    }
    return action;
  }

  async getActions(limit = 50): Promise<ActionLog[]> {
    if (this.isConnectedToMongo) {
      const docs = await ActionModel.find().sort({ timestamp: -1 }).limit(limit).lean();
      if (docs.length > 0) return docs as unknown as ActionLog[];
    }
    return this.actions.slice(0, limit);
  }

  // Context snapshot operations
  async saveContextSnapshot(snapshot: ContextSnapshot): Promise<void> {
    this.contextSnapshots.unshift(snapshot);
    if (this.contextSnapshots.length > 50) this.contextSnapshots.pop();
    if (this.isConnectedToMongo) {
      await ContextSnapshotModel.create(snapshot);
    }
  }

  async getLatestSnapshots(limit = 2): Promise<ContextSnapshot[]> {
    if (this.isConnectedToMongo) {
      const docs = await ContextSnapshotModel.find().sort({ timestamp: -1 }).limit(limit).lean();
      if (docs.length > 0) return docs as unknown as ContextSnapshot[];
    }
    return this.contextSnapshots.slice(0, limit);
  }

  // Memory
  async getMemories(userId?: string): Promise<Memory[]> {
    if (this.isConnectedToMongo) {
      const query = userId ? { userId } : {};
      const docs = await MemoryModel.find(query).lean();
      if (docs.length > 0) return docs as unknown as Memory[];
    }
    const all = Array.from(this.memories.values());
    return userId ? all.filter((m) => m.userId === userId) : all;
  }

  async saveMemory(memory: Memory): Promise<Memory> {
    this.memories.set(memory.id, memory);
    if (this.isConnectedToMongo) {
      await MemoryModel.updateOne({ id: memory.id }, { $set: memory }, { upsert: true });
    }
    return memory;
  }

  // Calendar
  async getEvents(): Promise<CalendarEvent[]> {
    if (this.isConnectedToMongo) {
      const docs = await EventModel.find().sort({ startTime: 1 }).lean();
      if (docs.length > 0) return docs as unknown as CalendarEvent[];
    }
    return Array.from(this.events.values());
  }

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
    if (this.isConnectedToMongo) {
      const docs = await TeamMemberModel.find().lean();
      if (docs.length > 0) return docs as unknown as TeamMember[];
    }
    return Array.from(this.teamMembers.values());
  }

  async updateTeamMember(member: TeamMember): Promise<TeamMember> {
    this.teamMembers.set(member.id, member);
    if (this.isConnectedToMongo) {
      await TeamMemberModel.updateOne({ id: member.id }, { $set: member }, { upsert: true });
    }
    return member;
  }

  // Itinerary
  async getItineraries(goalId: string): Promise<ItineraryRoute[]> {
    if (this.isConnectedToMongo) {
      const docs = await ItineraryModel.find({ goalId }).lean();
      if (docs.length > 0) return docs as unknown as ItineraryRoute[];
    }
    return Array.from(this.itineraries.values()).filter((i) => i.goalId === goalId);
  }

  async saveItinerary(itinerary: ItineraryRoute): Promise<ItineraryRoute> {
    this.itineraries.set(itinerary.id, itinerary);
    if (this.isConnectedToMongo) {
      await ItineraryModel.updateOne({ id: itinerary.id }, { $set: itinerary }, { upsert: true });
    }
    return itinerary;
  }
}

export const storage = new StorageEngine();
