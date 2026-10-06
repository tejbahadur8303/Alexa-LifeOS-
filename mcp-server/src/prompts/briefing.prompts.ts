export const briefingPrompts = [
  {
    name: 'daily_briefing',
    description: 'Generates a concise operational morning summary for Alexa+ voice output or console display.',
    arguments: [{ name: 'userId', description: 'User ID', required: false }],
    generateMessages: (args: { userId?: string }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are Alexa+ Guardian. Prepare a voice-friendly, crisp morning briefing for the user:
Cover:
- Active goals and today's deadline
- Risk assessment and traffic buffers
- Blocked tasks needing attention
- Consequential actions waiting for user approval
Keep the tone confident, operational, and focused on goal protection.`,
        },
      },
    ],
  },
];
