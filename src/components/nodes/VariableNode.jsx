import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";

function ValueRow({ id, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: "value" });
  const connected = connections.length > 0;
  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id="value" style={{ top: "50%", marginLeft: "-11px" }} />
      <span className="handle-label">Value</span>
      {!connected && (
        <input
          className="node-input small"
          value={data.value || ""}
          onChange={(e) => updateNodeData(id, { value: e.target.value })}
          placeholder="or connect"
        />
      )}
    </div>
  );
}

export default function VariableNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node variable-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        VARIABLE
        <Handle type="source" position={Position.Right} id="value" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <div className="node-row">
          <label>Name:</label>
          <input
            className="node-input small"
            value={data.name || ""}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
            placeholder="varName"
          />
        </div>
        <ValueRow id={id} data={data} updateNodeData={updateNodeData} />
        {result !== undefined && <div className="node-result">{JSON.stringify(result)}</div>}
      </div>
    </div>
  );
}
