"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeDetector = exports.ChangeDetector = void 0;
class ChangeDetector {
    detectDifferences(previous, current) {
        if (!previous) {
            return [
                {
                    category: 'schedule',
                    field: 'baseline_initialized',
                    previousValue: null,
                    currentValue: 'active_baseline',
                    deltaSummary: 'Baseline goal context snapshot captured.',
                    impactLevel: 'LOW',
                    affectedGoalId: current.goalId,
                    recommendedAction: 'Continue monitoring context streams for disruptions.',
                },
            ];
        }
        const changes = [];
        // 1. Travel ETA and Buffer changes
        if (previous.travel.etaMinutes !== current.travel.etaMinutes) {
            const diff = current.travel.etaMinutes - previous.travel.etaMinutes;
            const bufferDiff = current.travel.currentBufferMinutes - previous.travel.currentBufferMinutes;
            const isSevere = current.travel.currentBufferMinutes < 15 || diff >= 20;
            changes.push({
                category: 'travel',
                field: 'etaMinutes',
                previousValue: previous.travel.etaMinutes,
                currentValue: current.travel.etaMinutes,
                deltaSummary: `Travel ETA changed from ${previous.travel.etaMinutes}m to ${current.travel.etaMinutes}m (${diff > 0 ? '+' : ''}${diff}m). Buffer is now ${current.travel.currentBufferMinutes}m (was ${previous.travel.currentBufferMinutes}m).`,
                impactLevel: isSevere ? 'HIGH' : 'MEDIUM',
                affectedGoalId: current.goalId,
                recommendedAction: isSevere
                    ? 'Switch immediately to an alternative transit route or adjust departure time.'
                    : 'Monitor highway traffic updates.',
            });
        }
        // 2. Weather changes
        if (previous.weather.condition !== current.weather.condition) {
            const isBad = current.weather.rainProbabilityPercent >= 60 ||
                current.weather.condition.toLowerCase().includes('storm');
            changes.push({
                category: 'weather',
                field: 'condition',
                previousValue: previous.weather.condition,
                currentValue: current.weather.condition,
                deltaSummary: `Weather shifted from "${previous.weather.condition}" to "${current.weather.condition}" (Precipitation risk: ${current.weather.rainProbabilityPercent}%).`,
                impactLevel: isBad ? 'MEDIUM' : 'LOW',
                affectedGoalId: current.goalId,
                recommendedAction: isBad
                    ? 'Allocate extra travel contingency buffer for wet road conditions.'
                    : 'Normal conditions remain.',
            });
        }
        // 3. Task status changes
        if (previous.tasks.completed !== current.tasks.completed ||
            previous.tasks.blocked !== current.tasks.blocked) {
            const blockedDiff = current.tasks.blocked - previous.tasks.blocked;
            changes.push({
                category: 'tasks',
                field: 'blocked_tasks',
                previousValue: previous.tasks,
                currentValue: current.tasks,
                deltaSummary: `Task distribution updated: ${current.tasks.completed}/${current.tasks.total} completed, ${current.tasks.blocked} blocked (${blockedDiff > 0 ? '+' : ''}${blockedDiff} blocked).`,
                impactLevel: current.tasks.blocked > 0 ? 'HIGH' : 'LOW',
                affectedGoalId: current.goalId,
                recommendedAction: current.tasks.blocked > 0
                    ? 'Intervene on critical prerequisite blockers.'
                    : 'All active tasks proceeding normally.',
            });
        }
        // 4. Team status changes
        if (previous.team.ready !== current.team.ready ||
            previous.team.blocked !== current.team.blocked) {
            changes.push({
                category: 'team',
                field: 'team_readiness',
                previousValue: previous.team,
                currentValue: current.team,
                deltaSummary: `Team readiness status shifted: ${current.team.ready}/${current.team.total} ready.`,
                impactLevel: current.team.blocked > 0 ? 'MEDIUM' : 'LOW',
                affectedGoalId: current.goalId,
                recommendedAction: 'Verify pending member deliverables.',
            });
        }
        return changes;
    }
}
exports.ChangeDetector = ChangeDetector;
exports.changeDetector = new ChangeDetector();
