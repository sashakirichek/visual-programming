import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { formatValue } from "../../utils/valueUtils";

function CondRow({ id, handleId, label, dataKey, data, updateNodeData, placeholder }) {
  const connections = useHandleConnections({ type: "target", id: handleId });
  const connected = connections.length > 0;
  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id={handleId} style={{ top: "50%", marginLeft: "-10px" }} />
      <span className="handle-label">{label}</span>
      {!connected && (
        <input
          className="node-input small"
          value={data[dataKey] || ""}
          onChange={(e) => updateNodeData(id, { [dataKey]: e.target.value })}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function ConditionNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node condition-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      <div className="node-header drag-handle">
        CONDITION
        <Handle type="source" position={Position.Right} id="result" className="nodrag" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <CondRow
          id={id}
          handleId="condition"
          label="Cond"
          dataKey="condition"
          data={data}
          updateNodeData={updateNodeData}
          placeholder="or connect"
        />
        <CondRow
          id={id}
          handleId="true"
          label="T"
          dataKey="trueValue"
          data={data}
          updateNodeData={updateNodeData}
          placeholder="true value"
        />
        <CondRow
          id={id}
          handleId="false"
          label="F"
          dataKey="falseValue"
          data={data}
          updateNodeData={updateNodeData}
          placeholder="false value"
        />
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
