import { useFlowStore } from "../../store/flowStore";

export default function PropertiesPanel() {
  const selectedNode = useFlowStore((s) => s.selectedNode);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const nodes = useFlowStore((s) => s.nodes);
  const executionResults = useFlowStore((s) => s.executionResults);

  const node = nodes.find((n) => n.id === selectedNode);
  if (!node) {
    return (
      <div className="properties-panel">
        <div className="panel-title">Properties</div>
        <div className="empty-message">Select a node to view properties</div>
      </div>
    );
  }

  const result = executionResults[node.id];

  return (
    <div className="properties-panel">
      <div className="panel-title">Properties</div>

      <div className="prop-row">
        <label>ID</label>
        <span className="prop-value mono">{node.id}</span>
      </div>
      <div className="prop-row">
        <label>Type</label>
        <span className="prop-value">{node.type}</span>
      </div>
      <div className="prop-row">
        <label>Position</label>
        <span className="prop-value">
          x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
        </span>
      </div>

      <div className="prop-section-title">Data</div>
      {Object.entries(node.data || {}).map(([key, value]) => (
        <div key={key} className="prop-row">
          <label>{key}</label>
          <input
            className="prop-input"
            value={String(value || "")}
            onChange={(e) => updateNodeData(node.id, { [key]: e.target.value })}
          />
        </div>
      ))}

      {result !== undefined && (
        <>
          <div className="prop-section-title">Result</div>
          <div className="prop-result">
            <pre>{typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}</pre>
          </div>
        </>
      )}

      <div className="prop-actions">
        <button className="btn btn-danger" onClick={() => deleteNode(node.id)}>
          DEL NODE
        </button>
      </div>
    </div>
  );
}
