"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planner = exports.Planner = void 0;
class Planner {
    /**
     * Evaluates the active goal state, context, and risks to determine if replanning is needed
     */
    evaluateReplanning(goal, travel, tasks, risk, alternativeRoute) {
        const proposals = [];
        const reasons = [];
        // 1. Check Travel Buffer Risk
        if (travel.currentBufferMinutes < 15 && alternativeRoute) {
            reasons.push(`Traffic increased travel time to ${travel.etaMinutes}m, leaving only ${travel.currentBufferMinutes}m of buffer before deadline`);
            proposals.push({
                actionType: 'switch_route',
                title: 'Switch to Dedicated Express Transit Route',
                description: `Adopt "${alternativeRoute.routeName}" departing at ${new Date(alternativeRoute.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with an arrival of ${new Date(alternativeRoute.arrivalTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })} (${alternativeRoute.bufferMinutes}m safe buffer).`,
                impactSummary: `Restores arrival buffer from critical 5m to safe ${alternativeRoute.bufferMinutes}m. Avoids highway congestion completely.`,
                consequenceLevel: 'MEDIUM',
                requiresApproval: true,
                payload: {
                    routeId: alternativeRoute.id,
                    routeName: alternativeRoute.routeName,
                    mode: alternativeRoute.mode,
                    departureTime: alternativeRoute.departureTime,
                    arrivalTime: alternativeRoute.arrivalTime,
                },
            });
        }
        // 2. Check Downstream Blockers (e.g. Rahul Backend -> Demo Testing)
        const backendTask = tasks.find((t) => t.title.toLowerCase().includes('backend'));
        const demoTask = tasks.find((t) => t.title.toLowerCase().includes('demo'));
        if (backendTask && backendTask.status !== 'complete' && demoTask && demoTask.status === 'blocked') {
            reasons.push(`Backend deployment is incomplete, blocking demo testing`);
            proposals.push({
                actionType: 'send_message',
                title: 'Send Urgent Blocker Alert to Rahul',
                description: `Message Rahul regarding the backend deliverable blocking demo testing.`,
                impactSummary: `Notifies Rahul via Slack with urgency: "Hey Rahul, backend deployment is currently blocking demo testing for tomorrow's 9:00 AM hackathon pitch. Can you confirm staging readiness?"`,
                consequenceLevel: 'MEDIUM',
                requiresApproval: true,
                payload: {
                    recipient: 'Rahul',
                    recipientHandle: '@rahul_dev',
                    channel: 'slack',
                    message: "Hey Rahul, your backend deployment is currently blocking our demo testing for tomorrow's 9:00 AM hackathon pitch. Could you update staging so Alex can run the final test?",
                },
            });
        }
        if (proposals.length === 0) {
            return {
                replanRequired: false,
                proposals: [],
                summary: 'Current plan remains optimal and protected. No replanning necessary.',
            };
        }
        return {
            replanRequired: true,
            replanReason: reasons.join('; '),
            proposals,
            summary: `Guardian detected threats to your goal: ${reasons.join('. ')}. Generated ${proposals.length} protective mitigation action(s).`,
        };
    }
    /**
     * Natural language command interpreter mapping user voice/text to agent actions
     */
    interpretNaturalLanguage(command, context) {
        const text = command.toLowerCase().trim();
        if (text.includes('brief') || text.includes('summary')) {
            return {
                intent: 'daily_briefing',
                suggestedTool: 'generate_daily_briefing',
                response: `Briefing: You have 1 active goal ("${context.goal?.title || 'Hackathon'}"). Current risk level is ${context.risk?.riskLevel || 'LOW'}. Travel buffer is ${context.travel?.currentBufferMinutes || 30} minutes. Pending approvals: ${context.pendingApprovals?.length || 0}.`,
            };
        }
        if (text.includes('what changed') || text.includes('what has changed')) {
            return {
                intent: 'detect_changes',
                suggestedTool: 'detect_context_changes',
                response: 'Inspecting context snapshots for external shifts in traffic, weather, tasks, and team deliverables.',
            };
        }
        if (text.includes('why') && (text.includes('risk') || text.includes('at risk'))) {
            const reasons = context.risk?.reasons?.join('. ') || 'All safety criteria are currently satisfied.';
            return {
                intent: 'explain_risk',
                suggestedTool: 'analyze_goal_risk',
                response: `Goal risk is ${context.risk?.riskLevel || 'LOW'}: ${reasons}`,
            };
        }
        if (text.includes('take the alternative') ||
            text.includes('approve the recommended route') ||
            text.includes('switch route') ||
            text.includes('approve route')) {
            const routeApproval = context.pendingApprovals?.find((a) => a.actionType === 'switch_route');
            return {
                intent: 'approve_route',
                suggestedTool: 'resolve_approval',
                response: 'Applying alternative Express Transit route. Recalculating arrival buffer.',
                actionPayload: { approvalId: routeApproval?.id, decision: 'approved' },
            };
        }
        if (text.includes('message rahul') ||
            text.includes('yes') ||
            text.includes('contact rahul') ||
            text.includes('notify rahul')) {
            const msgApproval = context.pendingApprovals?.find((a) => a.actionType === 'send_message');
            return {
                intent: 'approve_message',
                suggestedTool: 'resolve_approval',
                response: 'Dispatching blocker notification to Rahul via Slack and logging verification.',
                actionPayload: { approvalId: msgApproval?.id, decision: 'approved' },
            };
        }
        if (text.includes('protect') || text.includes('make sure i reach') || text.includes('attend hackathon')) {
            return {
                intent: 'protect_goal',
                suggestedTool: 'create_goal',
                response: 'Guardian active. Monitoring departure times, traffic conditions, team deliverables, and blocker dependencies for your hackathon.',
            };
        }
        if (text.includes('what should i do next') || text.includes('next action')) {
            return {
                intent: 'next_actions',
                suggestedTool: 'generate_next_actions',
                response: `Next recommended actions: ${context.risk?.recommendedActions?.join('; ') || 'Review team slide deck'}`,
            };
        }
        return {
            intent: 'general_query',
            suggestedTool: 'get_goal_status',
            response: `Guardian is actively protecting your objective "${context.goal?.title || 'Hackathon'}".`,
        };
    }
}
exports.Planner = Planner;
exports.planner = new Planner();
