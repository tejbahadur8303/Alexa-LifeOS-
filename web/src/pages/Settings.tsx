import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Terminal, Database, Cpu, Brain, Check, Copy } from 'lucide-react';

export const Settings: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getMemories().then(setMemories).catch(console.error);
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const inspectorCommands = [
    {
      title: '1. Connect via MCP Inspector (Official GUI)',
      command: 'npx @modelcontextprotocol/inspector',
      desc: 'Opens the interactive MCP Inspector web client.',
    },
    {
      title: '2. Connect Inspector to LifeOS Guardian Streamable HTTP Transport',
      command: 'Transport: Streamable HTTP (SSE) | URL: http://localhost:5050/mcp',
      desc: 'Point the inspector to the running Guardian server endpoint.',
    },
    {
      title: '3. Test Direct MCP RPC Call via curl',
      command: `curl -X POST http://localhost:5050/mcp/rpc -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_travel_status","arguments":{}}}'`,
      desc: 'Invokes get_travel_status directly through the JSON-RPC interface.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System & MCP Configuration</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          MCP Inspector integration guides, operational memories, and architecture settings.
        </p>
      </div>

      {/* MCP Inspector Guide (Section 32) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-cyan-400 mb-3 font-mono text-xs font-bold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>MCP Inspector & Developer Integration (Section 32)</span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          LifeOS Guardian exposes standard Streamable HTTP endpoints fully compatible with the official Model Context Protocol Inspector, Alexa+ agents, and MCP clients.
        </p>

        <div className="space-y-3">
          {inspectorCommands.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white">{item.title}</span>
                <button
                  onClick={() => copyToClipboard(item.command, idx)}
                  className="text-slate-400 hover:text-cyan-400 text-xs flex items-center space-x-1"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-cyan-300 overflow-x-auto p-2 rounded bg-slate-900/60 border border-slate-800">
                {item.command}
              </pre>
              <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Memory Inspector (Section 24) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-purple-400 mb-3 font-mono text-xs font-bold uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>Guardian Structured Long-Term Memory (Section 24)</span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Guardian stores structured operational facts, preferences, and relationships rather than unstructured chat logs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {memories.map((m) => (
            <div key={m.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                  {m.memoryType}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Conf: {m.confidence * 100}%</span>
              </div>
              <div className="font-mono text-cyan-300 font-semibold mb-1 text-[11px]">{m.key}</div>
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                {JSON.stringify(m.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
