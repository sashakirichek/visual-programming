import { Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { VALUE_TYPE_OPTIONS, formatValue, getValuePlaceholder } from "../../utils/valueUtils";
import { getHandleColor } from "../../utils/typeChecker";
import ResizableNodeSelected from "../ResizableNodeSelected";

export default function InputNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const valueType = data.valueType || "literal";

  // Map valueType to type for handle color
  const getOutputType = () => {
    if (valueType === "map") return "map";
    if (valueType === "set") return "set";
    // Try to infer from value for literals
    if (valueType === "literal") {
      const value = data.value?.toString().toLowerCase();
      if (value === "true" || value === "false") return "boolean";
      if (!isNaN(parseFloat(value))) return "number";
      if (value?.startsWith("[")) return "array";
      if (value?.startsWith("{")) return "object";
      return "string";
    }
    return "any";
  };

  const outputType = getOutputType();

  return (
    <div
      className={`node input-node node-oneliner ${selected ? "selected" : ""}`}
      style={width ? { width } : undefined}
    >
      <ResizableNodeSelected isVisible={selected} />
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
        <Handle
          type="source"
          position={Position.Right}
          id="value"
          className="nodrag"
          style={{ top: "50%", backgroundColor: getHandleColor(outputType) }}
          data-type={outputType}
        />
      </div>
      {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
    </div>
  );
}
