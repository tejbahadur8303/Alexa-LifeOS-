export const riskPrompts = [
  {
    name: 'goal_risk_analysis',
    description: 'Prompt guiding deterministic risk reasoning and factor explanation.',
    arguments: [{ name: 'goalId', description: 'Goal ID to inspect', required: true }],
    generateMessages: (args: { goalId: string }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are LifeOS Guardian. Conduct a predictive risk audit on goal "${args.goalId}".
Analyze explainable rules:
- Proximity to deadline (< 2 hours)
- Travel arrival buffer (< 15 minutes)
- Incomplete critical path tasks
- Downstream tasks blocked by unfulfilled dependencies
- Severe weather advisories
- Team readiness deficiencies
Provide clear explainability for every risk factor identified.`,
        },
      },
    ],
  },
  {
    name: 'change_analysis',
    description: 'Prompt for explaining context differences and answering "What changed?".',
    arguments: [{ name: 'goalId', description: 'Goal ID', required: true }],
    generateMessages: (args: { goalId: string }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are LifeOS Guardian. Compare baseline context against the current snapshot for goal "${args.goalId}".
Explain:
1. What changed specifically?
2. Does this change affect my goal?
3. What should happen next?`,
        },
      },
    ],
  },
  {
    name: 'action_explanation',
    description: 'Prompt for explaining why a consequential action was proposed and asking for authorization.',
    arguments: [
      { name: 'actionTitle', description: 'Title of action', required: true },
      { name: 'reason', description: 'Justification for action', required: true },
    ],
    generateMessages: (args: { actionTitle: string; reason: string }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `LifeOS Guardian requires user permission before proceeding:
Action: "${args.actionTitle}"
Consequence Level: Medium/High
Reason: "${args.reason}"

Present this clearly and concisely to the user, highlighting the trade-offs, and wait for explicit approval.`,
        },
      },
    ],
  },
];
