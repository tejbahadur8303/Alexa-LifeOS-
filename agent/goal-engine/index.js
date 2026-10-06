"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalEngine = exports.GoalEngine = void 0;
class GoalEngine {
    evaluateGoal(goal, tasks, travel, teamMembers, risk) {
        const criteriaStatus = {};
        // 1. Arrive before deadline
        const deadlineMs = new Date(goal.deadline).getTime();
        const arrivalMs = new Date(travel.arrivalTime).getTime();
        const isArrivingOnTime = arrivalMs <= deadlineMs;
        const isBufferSafe = travel.currentBufferMinutes >= 20;
        criteriaStatus['arrive_before_deadline'] = {
            met: isArrivingOnTime && isBufferSafe,
            summary: isArrivingOnTime
                ? `Arrival estimated at ${new Date(travel.arrivalTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })} with ${travel.currentBufferMinutes}m buffer (${isBufferSafe ? 'Safe' : 'Tight buffer'}).`
                : `Arrival at ${new Date(travel.arrivalTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })} is after the 9:00 AM deadline!`,
        };
        // 2. Presentation ready
        const presentationTask = tasks.find((t) => t.title.toLowerCase().includes('presentation') || t.title.toLowerCase().includes('slides'));
        const presentationReady = presentationTask ? presentationTask.status === 'complete' : true;
        criteriaStatus['presentation_ready'] = {
            met: presentationReady,
            summary: presentationReady
                ? 'Presentation slides completed by Priya.'
                : 'Presentation slides still incomplete or pending review.',
        };
        // 3. Demo ready
        const demoTask = tasks.find((t) => t.title.toLowerCase().includes('demo'));
        const demoReady = demoTask ? demoTask.status === 'complete' : false;
        criteriaStatus['demo_ready'] = {
            met: demoReady,
            summary: demoReady
                ? 'Demo testing successfully validated.'
                : demoTask?.status === 'blocked'
                    ? `Demo testing is BLOCKED: ${demoTask.blockedReason || 'Prerequisite incomplete'}.`
                    : 'Demo testing in progress.',
        };
        // 4. Team ready
        const incompleteMembers = teamMembers.filter((m) => m.status !== 'ready');
        const teamReady = incompleteMembers.length === 0;
        criteriaStatus['team_ready'] = {
            met: teamReady,
            summary: teamReady
                ? 'All team members ready and accounted for.'
                : `${teamMembers.length - incompleteMembers.length}/${teamMembers.length} team members ready. Blocked: ${incompleteMembers
                    .map((m) => m.name)
                    .join(', ')}.`,
        };
        // Calculate overall health score (0 - 100)
        let score = 100;
        if (!criteriaStatus['arrive_before_deadline'].met)
            score -= 35;
        if (!criteriaStatus['demo_ready'].met)
            score -= 25;
        if (!criteriaStatus['team_ready'].met)
            score -= 15;
        if (!criteriaStatus['presentation_ready'].met)
            score -= 15;
        // Apply risk engine penalty
        const riskPenalty = Math.round(risk.riskScore * 0.2);
        score = Math.max(0, Math.min(100, score - riskPenalty));
        // Determine status
        let status = goal.status;
        if (goal.status !== 'completed' && goal.status !== 'cancelled') {
            if (risk.riskLevel === 'CRITICAL' || !isArrivingOnTime) {
                status = 'blocked';
            }
            else if (risk.riskLevel === 'HIGH' || score < 60) {
                status = 'at_risk';
            }
            else {
                status = 'active';
            }
        }
        const explanation = `Goal Health is ${score}%. ${status === 'at_risk'
            ? `Goal is AT RISK due to ${risk.reasons.join(', ')}.`
            : status === 'blocked'
                ? 'Goal has severe blockers requiring immediate user resolution.'
                : 'Goal is currently well-protected.'}`;
        return {
            healthScore: score,
            status,
            criteriaStatus,
            explanation,
        };
    }
}
exports.GoalEngine = GoalEngine;
exports.goalEngine = new GoalEngine();
