import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { formatValue } from "../../utils/valueUtils";

const OPERATORS = ["+", "-", "*", "/", "%", "**", "===", "!==", ">", "<", ">=", "<=", "&&", "||", "??"];

function OpRow({ id, handleId, label, dataKey, data, updateNodeData, placeholder }) {
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

export default function OperatorNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node operator-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      <div className="node-header drag-handle">
        OPERATOR
        <Handle type="source" position={Position.Right} id="result" className="nodrag" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <OpRow
          id={id}
          handleId="a"
          label="A"
          dataKey="aValue"
          data={data}
          updateNodeData={updateNodeData}
          placeholder="or connect"
        />
        <select
          className="node-select"
          value={data.operator || "+"}
          onChange={(e) => updateNodeData(id, { operator: e.target.value })}
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <OpRow
          id={id}
          handleId="b"
          label="B"
          dataKey="bValue"
          data={data}
          updateNodeData={updateNodeData}
          placeholder="or connect"
        />
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
