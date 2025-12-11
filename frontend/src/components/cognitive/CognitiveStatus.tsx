"use client";

import { CognitiveTrace } from '@/types/aura';
import { Cpu, Brain, Sparkles, Database, Zap, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  trace: CognitiveTrace;
  showMetrics?: boolean;
}

export default function CognitiveStatus({ trace, showMetrics = true }: Props) {
  const isL1 = trace.layer === 'L1';
  const isL2 = trace.layer === 'L2';
  const isL3 = trace.layer === 'L3';
  const isDream = trace.layer === 'Dream';
  const isProcessing = trace.status === 'processing' || trace.status === 'streaming';

  const layers = [
    {
      id: 'L1',
      name: 'INSTINCT',
      icon: Database,
      description: 'RAG + Fast Retrieval',
      color: 'green',
      active: isL1,
      bgColor: 'bg-green-900/40',
      textColor: 'text-green-300',
      borderColor: 'border-green-700',
      glowColor: 'bg-green-500',
    },
    {
      id: 'L2',
      name: 'REASONING',
      icon: Brain,
      description: 'Deep Analysis + Logic',
      color: 'blue',
      active: isL2,
      bgColor: 'bg-blue-900/40',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-700',
      glowColor: 'bg-blue-500',
    },
    {
      id: 'L3',
      name: 'SYNTHESIS',
      icon: Sparkles,
      description: 'Persona + Response',
      color: 'purple',
      active: isL3,
      bgColor: 'bg-purple-900/40',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-700',
      glowColor: 'bg-purple-500',
    },
    {
      id: 'Dream',
      name: 'DREAM',
      icon: Moon,
      description: 'Offline Consolidation',
      color: 'indigo',
      active: isDream,
      bgColor: 'bg-indigo-900/40',
      textColor: 'text-indigo-300',
      borderColor: 'border-indigo-700',
      glowColor: 'bg-indigo-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2 p-4 bg-black/40 border border-green-900/50 rounded-lg backdrop-blur-sm font-mono text-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between text-green-400 mb-2 border-b border-green-900 pb-2">
        <div className="flex items-center gap-2">
          <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
          <span>COGNITIVE_LAYERS</span>
        </div>
        <div
          className={clsx(
            'w-2 h-2 rounded-full',
            isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
          )}
        />
      </div>

      {/* Layer Stack */}
      <div className="space-y-2">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 border',
                layer.active && isProcessing
                  ? `${layer.bgColor} ${layer.textColor} ${layer.borderColor} shadow-lg`
                  : layer.active
                  ? `${layer.bgColor} ${layer.textColor} ${layer.borderColor}`
                  : 'text-gray-600 border-gray-800/50 hover:border-gray-700'
              )}
            >
              {/* Icon */}
              <div className="relative">
                <Icon size={16} />
                {layer.active && isProcessing && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0"
                  >
                    <Icon size={16} />
                  </motion.div>
                )}
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{layer.id}: {layer.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{layer.description}</div>
              </div>

              {/* Status Indicator */}
              {layer.active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  {isProcessing ? (
                    <>
                      <Zap size={10} className="animate-pulse" />
                      <div className={`w-2 h-2 rounded-full ${layer.glowColor} animate-ping`} />
                    </>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${layer.glowColor}`} />
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Metrics Panel */}
      {showMetrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 pt-3 border-t border-green-900/50 space-y-1.5"
        >
          {/* Active Model */}
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-500">ACTIVE_MODEL:</span>
            <span className="text-green-400 font-bold truncate max-w-[60%]" title={trace.model}>
              {trace.model || 'STANDBY'}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-500">STATUS:</span>
            <span
              className={clsx(
                'font-bold uppercase',
                trace.status === 'idle' && 'text-gray-400',
                trace.status === 'processing' && 'text-yellow-400 animate-pulse',
                trace.status === 'streaming' && 'text-blue-400 animate-pulse',
                trace.status === 'complete' && 'text-green-400'
              )}
            >
              {trace.status}
            </span>
          </div>

          {/* Latency */}
          {trace.latency_ms > 0 && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500">LATENCY:</span>
              <span
                className={clsx(
                  'font-bold',
                  trace.latency_ms < 500 && 'text-green-400',
                  trace.latency_ms >= 500 && trace.latency_ms < 2000 && 'text-yellow-400',
                  trace.latency_ms >= 2000 && 'text-red-400'
                )}
              >
                {trace.latency_ms.toFixed(0)}ms
              </span>
            </div>
          )}

          {/* Tokens (if available) */}
          {trace.tokens_used && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500">TOKENS:</span>
              <span className="text-blue-400 font-bold">
                {trace.tokens_used.toLocaleString()}
              </span>
            </div>
          )}

          {/* Confidence (if available) */}
          {trace.confidence !== undefined && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500">CONFIDENCE:</span>
              <span
                className={clsx(
                  'font-bold',
                  trace.confidence >= 0.8 && 'text-green-400',
                  trace.confidence >= 0.5 && trace.confidence < 0.8 && 'text-yellow-400',
                  trace.confidence < 0.5 && 'text-red-400'
                )}
              >
                {(trace.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Processing Animation Overlay */}
      {isProcessing && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"
        />
      )}
    </motion.div>
  );
}

