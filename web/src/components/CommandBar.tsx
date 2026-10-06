import React, { useState } from 'react';
import { Mic, Send, Sparkles, CornerDownLeft } from 'lucide-react';

interface CommandBarProps {
  onSendCommand: (command: string) => Promise<any>;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSendCommand }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const handleSubmit = async (cmdText?: string) => {
    const textToSend = cmdText || input;
    if (!textToSend.trim() || loading) return;

    try {
      setLoading(true);
      const res = await onSendCommand(textToSend);
      setLastResponse(res.response || 'Action processed by Guardian.');
      setInput('');
    } catch (err: any) {
      setLastResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Alexa, make sure I reach my hackathon tomorrow by 9 AM and my team is ready.',
    'Brief me.',
    'What changed?',
    'Why is my hackathon goal at risk?',
    'Take the alternative.',
    'Message Rahul.',
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Alexa+ Voice & Intent Simulator</span>
        </div>
        <span className="text-[11px] text-slate-500">Autonomous Goal Command Engine</span>
      </div>

      {/* Input box */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-cyan-400">
          <Mic className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='Try: "Alexa, make sure I reach my hackathon tomorrow by 9 AM..."'
          className="w-full pl-9 pr-24 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans transition-all"
        />
        <button
          onClick={() => handleSubmit()}
          disabled={loading || !input.trim()}
          className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1 transition-all"
        >
          <span>Send</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-slate-500 mr-1">Quick Alexa queries:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSubmit(p)}
            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all truncate max-w-xs"
          >
            "{p}"
          </button>
        ))}
      </div>

      {/* Agent Response Callout */}
      {lastResponse && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-xs text-cyan-200 flex items-start space-x-2">
          <span className="font-mono text-cyan-400 font-bold flex-shrink-0">Guardian:</span>
          <p className="leading-relaxed">{lastResponse}</p>
        </div>
      )}
    </div>
  );
};
