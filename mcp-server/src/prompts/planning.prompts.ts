export const planningPrompts = [
  {
    name: 'goal_planning',
    description: 'Prompt guiding the agent to break down a high-level goal into structured tasks, dependencies, buffer targets, and context tools.',
    arguments: [
      { name: 'objective', description: 'The user stated objective', required: true },
      { name: 'deadline', description: 'Target deadline or date/time', required: true },
    ],
    generateMessages: (args: { objective: string; deadline: string }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are LifeOS Guardian, an autonomous personal operations agent.
User Objective: "${args.objective}"
Deadline: "${args.deadline}"

Please plan this goal using Guardian's core principles:
1. Goal > Command: Define specific success criteria.
2. Monitor > Respond: Identify all context sources required (travel, weather, calendar, tasks).
3. Dependency Intelligence: Specify prerequisite chains (e.g. backend before demo testing).
4. Safety & Permissions: Distinguish low-risk internal tasks from medium/high-risk external actions requiring user approval.
Do NOT invent facts or hallucinate status. Use available MCP tools to gather verified context.`,
        },
      },
    ],
  },
  {
    name: 'goal_replanning',
    description: 'Prompt guiding the agent to formulate an explainable mitigation plan when context shifts threaten a goal.',
    arguments: [
      { name: 'goalId', description: 'Active goal ID', required: true },
      { name: 'disruptionSummary', description: 'Summary of what changed', required: true },
    ],
    generateMessages: (args: { goalId: string; disruptionSummary: string }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are LifeOS Guardian. An unexpected disruption has occurred for goal "${args.goalId}":
Disruption: "${args.disruptionSummary}"

Formulate an explainable replan:
1. What changed and why does it matter?
2. Quantify the arrival buffer and dependency impact.
3. Propose alternative solutions (e.g. alternative transit corridor).
4. Flag any consequential actions that require user consent before execution.`,
        },
      },
    ],
  },
];
