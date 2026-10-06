"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskEngine = exports.RiskEngine = void 0;
class RiskEngine {
    evaluateRisk(input) {
        const { goal, tasks, travel, weather, teamMembers } = input;
        let score = 0;
        const reasons = [];
        const recommendedActions = [];
        // 1. Deadline < 2 hours (+30)
        const deadlineMs = new Date(goal.deadline).getTime();
        const nowMs = Date.now();
        const hoursToDeadline = (deadlineMs - nowMs) / (1000 * 60 * 60);
        // If deadline is in less than 2 hours or in the past
        if (hoursToDeadline > 0 && hoursToDeadline < 2) {
            score += 30;
            reasons.push(`Goal deadline is in less than 2 hours (${Math.round(hoursToDeadline * 60)} minutes remaining)`);
            recommendedActions.push('Prioritize immediate departure and blocker resolution');
        }
        // 2. Travel buffer < 15 minutes (+25)
        if (travel.currentBufferMinutes < 15) {
            score += 25;
            reasons.push(`Travel buffer is only ${travel.currentBufferMinutes} minutes before the ${new Date(goal.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} deadline (minimum safe buffer is 30m)`);
            recommendedActions.push('Switch to high-speed alternative route or depart immediately');
        }
        else if (travel.currentBufferMinutes < 30) {
            // Moderate warning
            score += 10;
            reasons.push(`Travel buffer (${travel.currentBufferMinutes}m) is below your preferred 30-minute threshold`);
        }
        // 3. Critical task incomplete (+25)
        const incompleteCriticalTasks = tasks.filter((t) => t.isCritical && t.status !== 'complete');
        if (incompleteCriticalTasks.length > 0) {
            score += 25;
            const titles = incompleteCriticalTasks.map((t) => `"${t.title}" (${t.assignee})`).join(', ');
            reasons.push(`Critical task(s) incomplete: ${titles}`);
            recommendedActions.push('Coordinate with assignees to complete critical prerequisites');
        }
        // 4. Dependency blocked (+20)
        const blockedTasks = tasks.filter((t) => t.status === 'blocked');
        if (blockedTasks.length > 0) {
            score += 20;
            const blockerList = blockedTasks.map((t) => `"${t.title}" (${t.blockedReason || 'blocked by dependency'})`).join(', ');
            reasons.push(`Downstream workflow blocked: ${blockerList}`);
            recommendedActions.push('Unblock dependencies by accelerating prerequisite deliverable');
        }
        // 5. Bad weather (+10)
        if (weather && (weather.rainProbabilityPercent >= 60 || weather.condition.toLowerCase().includes('storm'))) {
            score += 10;
            reasons.push(`Adverse weather detected: ${weather.condition} (${weather.rainProbabilityPercent}% precip risk)`);
            recommendedActions.push('Account for transit delays and carry protective equipment');
        }
        // 6. Team member incomplete (+10)
        const incompleteMembers = teamMembers.filter((m) => m.status === 'incomplete' || m.status === 'blocked');
        if (incompleteMembers.length > 0) {
            score += 10;
            const names = incompleteMembers.map((m) => `${m.name} (${m.assignedDeliverable})`).join(', ');
            reasons.push(`Team member deliverable(s) incomplete: ${names}`);
            recommendedActions.push('Send automated status check or blocker notification to team');
        }
        // Normalize score to 0 - 100
        const riskScore = Math.min(100, Math.max(0, score));
        // Determine level
        let riskLevel = 'LOW';
        if (riskScore >= 80) {
            riskLevel = 'CRITICAL';
        }
        else if (riskScore >= 60) {
            riskLevel = 'HIGH';
        }
        else if (riskScore >= 30) {
            riskLevel = 'MEDIUM';
        }
        // Dedup actions
        const uniqueActions = Array.from(new Set(recommendedActions));
        return {
            id: `risk_${goal.id}_${Date.now()}`,
            goalId: goal.id,
            riskLevel,
            riskScore,
            reasons,
            affectedGoals: [goal.id],
            recommendedActions: uniqueActions.length > 0 ? uniqueActions : ['Continue monitoring current plan'],
            evaluatedAt: new Date().toISOString(),
        };
    }
    explainDecision(risk, goal, travel) {
        if (risk.riskLevel === 'LOW') {
            return `Your goal "${goal.title}" is currently on track with ${travel.currentBufferMinutes} minutes of arrival buffer and no critical blockers.`;
        }
        const reasonSummary = risk.reasons.slice(0, 3).join('. ');
        return `Goal "${goal.title}" is classified as ${risk.riskLevel} risk (score ${risk.riskScore}/100). Key factors: ${reasonSummary}. Recommended action: ${risk.recommendedActions[0] || 'Review timeline'}.`;
    }
}
exports.RiskEngine = RiskEngine;
exports.riskEngine = new RiskEngine();
