import { Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";

export default function InputNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node input-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        INPUT
        <Handle type="source" position={Position.Right} id="value" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <div className="node-row">
          <label>Value:</label>
          <input
            className="node-input small"
            value={data.value || ""}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
            placeholder="Enter value..."
          />
        </div>
        {result !== undefined && <div className="node-result">{JSON.stringify(result)}</div>}
      </div>
    </div>
  );
}
