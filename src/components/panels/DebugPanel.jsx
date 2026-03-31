import { useFlowStore } from "../../store/flowStore";

export default function DebugPanel() {
  const debugMode = useFlowStore((s) => s.debugMode);
  const debugStep = useFlowStore((s) => s.debugStep);
  const debugSteps = useFlowStore((s) => s.debugSteps);
  const setDebugStep = useFlowStore((s) => s.setDebugStep);
  const consoleLogs = useFlowStore((s) => s.consoleLogs);

  if (!debugMode || !debugSteps.length) return null;

  const step = debugSteps[debugStep];

  return (
    <div className="debug-panel">
      <div className="debug-stepper">
        <button
          className="debug-btn"
          onClick={() => setDebugStep(Math.max(0, debugStep - 1))}
          disabled={debugStep <= 0}
        >
          ◀
        </button>
        <span className="debug-step-info">
          {debugStep + 1}/{debugSteps.length}
        </span>
        <button
          className="debug-btn"
          onClick={() => setDebugStep(Math.min(debugSteps.length - 1, debugStep + 1))}
          disabled={debugStep >= debugSteps.length - 1}
        >
          ▶
        </button>
        {step && (
          <>
            <span className="debug-node-name">{step.nodeLabel}</span>
            <span className="debug-result">
              {typeof step.result === "object" ? JSON.stringify(step.result) : String(step.result ?? "—")}
            </span>
          </>
        )}
      </div>
      {consoleLogs.length > 0 && (
        <div className="debug-logs">
          {consoleLogs.map((log, i) => (
            <span key={i} className="debug-log-item">
              {typeof log.value === "object" ? JSON.stringify(log.value) : String(log.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
