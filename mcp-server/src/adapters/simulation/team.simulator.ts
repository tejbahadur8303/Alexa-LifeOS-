import type { TeamMember } from '../../models/types.js';
import { storage } from '../../db/storage.js';

export interface TeamProvider {
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | null>;
  updateMemberStatus(id: string, status: 'ready' | 'incomplete' | 'blocked'): Promise<TeamMember | null>;
  resetToNormal(): Promise<void>;
}

export class SimulatedTeamProvider implements TeamProvider {
  async getTeamMembers(): Promise<TeamMember[]> {
    return storage.getTeamMembers();
  }

  async getTeamMember(id: string): Promise<TeamMember | null> {
    const all = await storage.getTeamMembers();
    return all.find((m) => m.id === id || m.name.toLowerCase() === id.toLowerCase()) || null;
  }

  async updateMemberStatus(
    id: string,
    status: 'ready' | 'incomplete' | 'blocked'
  ): Promise<TeamMember | null> {
    const member = await this.getTeamMember(id);
    if (!member) return null;
    member.status = status;
    return storage.updateTeamMember(member);
  }

  async resetToNormal(): Promise<void> {
    await this.updateMemberStatus('team_rahul', 'incomplete');
    await this.updateMemberStatus('team_aman', 'ready');
    await this.updateMemberStatus('team_priya', 'ready');
  }
}

export const teamSimulator = new SimulatedTeamProvider();
