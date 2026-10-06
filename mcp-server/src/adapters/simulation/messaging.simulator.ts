import { v4 as uuidv4 } from 'uuid';

export interface SimulatedMessage {
  id: string;
  recipient: string;
  recipientHandle?: string;
  channel: 'sms' | 'slack' | 'email' | 'push';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'acknowledged';
  verified: boolean;
}

export interface MessagingProvider {
  sendMessage(
    recipient: string,
    content: string,
    channel?: 'sms' | 'slack' | 'email' | 'push'
  ): Promise<SimulatedMessage>;
  getSentMessages(): Promise<SimulatedMessage[]>;
  verifyDelivery(messageId: string): Promise<boolean>;
}

export class SimulatedMessagingProvider implements MessagingProvider {
  private sentMessages: SimulatedMessage[] = [];

  async sendMessage(
    recipient: string,
    content: string,
    channel: 'sms' | 'slack' | 'email' | 'push' = 'slack'
  ): Promise<SimulatedMessage> {
    const message: SimulatedMessage = {
      id: `msg_${uuidv4().slice(0, 8)}`,
      recipient,
      recipientHandle: recipient.startsWith('@') ? recipient : `@${recipient.toLowerCase()}`,
      channel,
      content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      verified: true,
    };

    this.sentMessages.unshift(message);
    return message;
  }

  async getSentMessages(): Promise<SimulatedMessage[]> {
    return [...this.sentMessages];
  }

  async verifyDelivery(messageId: string): Promise<boolean> {
    const msg = this.sentMessages.find((m) => m.id === messageId);
    return msg ? msg.verified : false;
  }

  async clear(): Promise<void> {
    this.sentMessages = [];
  }
}

export const messagingSimulator = new SimulatedMessagingProvider();
