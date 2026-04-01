import { Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { VALUE_TYPE_OPTIONS, formatValue, getValuePlaceholder } from "../../utils/valueUtils";

export default function InputNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const valueType = data.valueType || "literal";

  return (
    <div
      className={`node input-node node-oneliner ${selected ? "selected" : ""}`}
      style={width ? { width } : undefined}
    >
      <div className="node-header drag-handle">
        INPUT
        <select
          className="node-select node-inline-select nodrag"
          value={valueType}
          onChange={(e) => updateNodeData(id, { valueType: e.target.value })}
          title="Input value type"
        >
          {VALUE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          className="node-input nodrag"
          value={data.value ?? ""}
          onChange={(e) => updateNodeData(id, { value: e.target.value })}
          placeholder={getValuePlaceholder(valueType)}
        />
        <Handle type="source" position={Position.Right} id="value" className="nodrag" style={{ top: "50%" }} />
      </div>
      {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
    </div>
  );
}
