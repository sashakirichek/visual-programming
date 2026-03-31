import { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { executeGraph } from '../utils/nodeExecutor';
import JsonImportExportModal from './modals/JsonImportExportModal';

export default function Toolbar({ activePanel, setActivePanel }) {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const isRunning = useFlowStore((s) => s.isRunning);
  const debugMode = useFlowStore((s) => s.debugMode);
  const setExecutionResults = useFlowStore((s) => s.setExecutionResults);
  const setDebugMode = useFlowStore((s) => s.setDebugMode);
  const setDebugStep = useFlowStore((s) => s.setDebugStep);
  const setDebugSteps = useFlowStore((s) => s.setDebugSteps);
  const setIsRunning = useFlowStore((s) => s.setIsRunning);
  const clearResults = useFlowStore((s) => s.clearResults);

  const [showJson, setShowJson] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setDebugMode(false);
    try {
      const { results } = executeGraph(nodes, edges);
      setExecutionResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDebug = () => {
    const { results, steps } = executeGraph(nodes, edges);
    setExecutionResults(results);
    setDebugSteps(steps);
    setDebugStep(0);
    setDebugMode(true);
    setActivePanel('debug');
  };

  const handleStopDebug = () => {
    setDebugMode(false);
    setDebugSteps([]);
    setDebugStep(0);
  };

  const handleClear = () => {
    clearResults();
    setDebugMode(false);
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">Visual Programmer</span>
        </div>

        <div className="toolbar-actions">
          <button
            className={`toolbar-btn ${activePanel === 'palette' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'palette' ? null : 'palette')}
            title="Node Palette"
          >
            🧩 Nodes
          </button>
          <button
            className={`toolbar-btn ${activePanel === 'modules' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'modules' ? null : 'modules')}
            title="Modules"
          >
            📦 Modules
          </button>
          <button
            className={`toolbar-btn ${activePanel === 'properties' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'properties' ? null : 'properties')}
            title="Properties"
          >
            ⚙️ Properties
          </button>

          <div className="toolbar-separator" />

          <button
            className="toolbar-btn run-btn"
            onClick={handleRun}
            disabled={isRunning || nodes.length === 0}
            title="Run flow"
          >
            ▶ Run
          </button>

          {debugMode ? (
            <button
              className="toolbar-btn debug-stop-btn"
              onClick={handleStopDebug}
              title="Stop debugging"
            >
              ⏹ Stop Debug
            </button>
          ) : (
            <button
              className="toolbar-btn debug-btn"
              onClick={handleDebug}
              disabled={nodes.length === 0}
              title="Run in debug mode"
            >
              🐛 Debug
            </button>
          )}

          <button
            className="toolbar-btn"
            onClick={handleClear}
            title="Clear results"
          >
            🗑 Clear
          </button>

          <div className="toolbar-separator" />

          <button
            className="toolbar-btn json-btn"
            onClick={() => setShowJson(true)}
            title="Import/Export JSON"
          >
            📄 JSON
          </button>
        </div>

        <div className="toolbar-status">
          {isRunning && <span className="status-running">Running...</span>}
          {debugMode && <span className="status-debug">🐛 Debug Mode</span>}
          <span className="status-info">{nodes.length} nodes · {edges.length} edges</span>
        </div>
      </div>

      {showJson && <JsonImportExportModal onClose={() => setShowJson(false)} />}
    </>
  );
}
