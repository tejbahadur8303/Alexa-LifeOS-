import React, { useState } from 'react';
import { Layers, ArrowDown, CheckCircle2, AlertOctagon, Clock, User, AlertCircle } from 'lucide-react';
import type { Task } from '../types/index.js';

interface DependencyGraphProps {
  tasks: Task[];
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[1] || tasks[0] || null);

  // Group or organize tasks into dependency flow
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Workflow Dependency Intelligence Graph
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500">Click a node to inspect blockers</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visual Pipeline */}
        <div className="lg:col-span-2 space-y-3">
          {tasks.map((t, idx) => {
            const isSelected = selectedTask?.id === t.id;
            const isBlocked = t.status === 'blocked';
            const isComplete = t.status === 'complete';

            return (
              <React.Fragment key={t.id}>
                <div
                  onClick={() => setSelectedTask(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-slate-850 shadow-lg shadow-cyan-500/10'
                      : isBlocked
                      ? 'border-rose-800/60 bg-rose-950/10 hover:border-rose-600'
                      : isComplete
                      ? 'border-emerald-800/40 bg-emerald-950/10 hover:border-emerald-700'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : isBlocked ? (
                        <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{t.title}</h4>
                          {t.isCritical && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">
                              CRITICAL PATH
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.assignee}</span>
                          <span>•</span>
                          <span>{t.description || 'Deliverable checkpoint'}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        isComplete
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isBlocked
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {isBlocked && t.blockedReason && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>{t.blockedReason}</span>
                    </div>
                  )}
                </div>

                {idx < tasks.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Node Inspector */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 lg:sticky lg:top-24 h-fit">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
            Node Inspector
          </h4>

          {selectedTask ? (
            <div className="space-y-4">
              <div>
                <h5 className="text-base font-bold text-white">{selectedTask.title}</h5>
                <p className="text-xs text-slate-400 mt-1">{selectedTask.description}</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-500">Status</span>
                  <span className="text-white font-bold uppercase">{selectedTask.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-500">Assignee</span>
                  <span className="text-cyan-400">{selectedTask.assignee}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-500">Prerequisites</span>
                  <span className="text-slate-300">
                    {selectedTask.dependencies.length > 0
                      ? selectedTask.dependencies.join(', ')
                      : 'None (Root Task)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-500">Critical Path</span>
                  <span className={selectedTask.isCritical ? 'text-rose-400' : 'text-slate-400'}>
                    {selectedTask.isCritical ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {selectedTask.status === 'blocked' ? (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs">
                  <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block mb-1">
                    Blocked Reason:
                  </span>
                  <p className="text-rose-200">
                    {selectedTask.blockedReason || 'Waiting for prerequisite task completion.'}
                  </p>
                  <div className="mt-2 font-mono text-[11px] text-amber-400">
                    Recommended Action: Alert {tasks.find(t => selectedTask.dependencies.includes(t.id))?.assignee || 'Assignee'} to prioritize prerequisite.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                    Task Status Nominal
                  </span>
                  <p>All prerequisite conditions for this milestone are satisfied.</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select any node on the left to inspect.</p>
          )}
        </div>
      </div>
    </div>
  );
};
