import { useFlowStore } from "../../store/flowStore";

export default function DebugPanel() {
  const debugMode = useFlowStore((s) => s.debugMode);
  const debugStep = useFlowStore((s) => s.debugStep);
  const debugSteps = useFlowStore((s) => s.debugSteps);
  const setDebugStep = useFlowStore((s) => s.setDebugStep);
  const executionResults = useFlowStore((s) => s.executionResults);
  const consoleLogs = useFlowStore((s) => s.consoleLogs);
  const nodes = useFlowStore((s) => s.nodes);

  if (!debugMode) return null;

  const currentStep = debugSteps[debugStep];
  const activeNodeId = currentStep?.nodeId;

  return (
    <div className="debug-panel">
      <div className="debug-top-row">
        <div className="debug-controls">
          <button
            className="debug-btn"
            onClick={() => setDebugStep(Math.max(0, debugStep - 1))}
            disabled={debugStep <= 0}
          >
            {"<<"} PREV
          </button>
          <span className="debug-step-info">
            Step {debugStep + 1} / {debugSteps.length}
          </span>
          <button
            className="debug-btn"
            onClick={() => setDebugStep(Math.min(debugSteps.length - 1, debugStep + 1))}
            disabled={debugStep >= debugSteps.length - 1}
          >
            NEXT {">>"}
          </button>
        </div>
        {currentStep && (
          <div className="debug-current">
            <span className="debug-node-name">
              {"> "}
              {currentStep.nodeLabel}
            </span>
            <span className="debug-result">
              {typeof currentStep.result === "object" ? JSON.stringify(currentStep.result) : String(currentStep.result)}
            </span>
          </div>
        )}
      </div>

      <div className="debug-columns">
        <div className="debug-watch">
          <div className="debug-watch-title">Watch</div>
          {nodes.map((node) => {
            const res = executionResults[node.id];
            const isActive = node.id === activeNodeId;
            if (res === undefined) return null;
            return (
              <div key={node.id} className={`debug-watch-item ${isActive ? "active" : ""}`}>
                <span className="watch-node">{node.data?.name || node.data?.label || node.type}</span>
                <span className="watch-value">{typeof res === "object" ? JSON.stringify(res) : String(res)}</span>
              </div>
            );
          })}
        </div>

        <div className="debug-steps-list">
          <div className="debug-steps-title">Trace</div>
          {debugSteps.map((step, i) => (
            <div
              key={i}
              className={`debug-step-item ${i === debugStep ? "current" : ""} ${i < debugStep ? "done" : ""}`}
              onClick={() => setDebugStep(i)}
            >
              <span className="step-num">{i + 1}.</span>
              <span className="step-label">{step.nodeLabel}</span>
              <span className="step-result">
                {typeof step.result === "object" ? JSON.stringify(step.result) : String(step.result ?? "—")}
              </span>
            </div>
          ))}
        </div>

        {consoleLogs.length > 0 && (
          <div className="debug-console">
            <div className="debug-steps-title">Console</div>
            {consoleLogs.map((log, i) => (
              <div key={i} className="debug-console-line">
                <span className="console-prefix">&gt;</span>
                <span className="console-value">
                  {typeof log.value === "object" ? JSON.stringify(log.value) : String(log.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
