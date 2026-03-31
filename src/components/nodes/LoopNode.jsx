import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";

const LOOP_OPS = ["forEach", "map", "filter"];

function ArrayRow({ id, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: "array" });
  const connected = connections.length > 0;
  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id="array" style={{ top: "50%", marginLeft: "-11px" }} />
      <span className="handle-label">Array</span>
      {!connected && (
        <input
          className="node-input small"
          value={data.array || ""}
          onChange={(e) => updateNodeData(id, { array: e.target.value })}
          placeholder="[1,2,3] or connect"
        />
      )}
    </div>
  );
}

export default function LoopNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node loop-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        LOOP
        <Handle type="source" position={Position.Right} id="result" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <select
          className="node-select"
          value={data.loopOp || "forEach"}
          onChange={(e) => updateNodeData(id, { loopOp: e.target.value })}
        >
          {LOOP_OPS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <ArrayRow id={id} data={data} updateNodeData={updateNodeData} />
        <div className="node-row">
          <label>{data.loopOp === 'filter' ? 'Predicate:' : data.loopOp === 'map' ? 'Transform:' : 'Effect:'}</label>
          <input
            className="node-input small"
            value={data.transform || ''}
            onChange={(e) => updateNodeData(id, { transform: e.target.value })}
            placeholder={
              data.loopOp === 'map' ? '(item) => item * 2'
              : data.loopOp === 'filter' ? '(item) => item > 0'
              : '(item) => item * 2'
            }
          />
        </div>
        {result !== undefined && (
          <div className="node-result">{Array.isArray(result) ? `[${result.join(", ")}]` : String(result)}</div>
        )}
      </div>
    </div>
  );
}
