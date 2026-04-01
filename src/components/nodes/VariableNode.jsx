import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { VALUE_TYPE_OPTIONS, formatValue, getValuePlaceholder } from "../../utils/valueUtils";

function ValueTypeRow({ id, data, updateNodeData }) {
  return (
    <div className="node-row">
      <label>Type:</label>
      <select
        className="node-select small"
        value={data.valueType || "literal"}
        onChange={(e) => updateNodeData(id, { valueType: e.target.value })}
      >
        {VALUE_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ValueRow({ id, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: "value" });
  const connected = connections.length > 0;
  const valueType = data.valueType || "literal";
  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id="value" style={{ top: "50%", marginLeft: "-10px" }} />
      <span className="handle-label">Value</span>
      {!connected && (
        <input
          className="node-input small"
          value={data.value ?? ""}
          onChange={(e) => updateNodeData(id, { value: e.target.value })}
          placeholder={getValuePlaceholder(valueType)}
        />
      )}
    </div>
  );
}

export default function VariableNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node variable-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      <div className="node-header drag-handle">
        VARIABLE
        <Handle type="source" position={Position.Right} id="value" className="nodrag" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <div className="node-row">
          <label>Name:</label>
          <input
            className="node-input small"
            value={data.name ?? ""}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
            placeholder="varName"
          />
        </div>
        <ValueTypeRow id={id} data={data} updateNodeData={updateNodeData} />
        <ValueRow id={id} data={data} updateNodeData={updateNodeData} />
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
