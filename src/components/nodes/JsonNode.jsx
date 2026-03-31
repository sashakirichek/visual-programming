import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";

const JSON_OPS = ["parse", "stringify", "get", "set", "template"];

function JsonInputRow({ id, data, updateNodeData, op }) {
  const connections = useHandleConnections({ type: "target", id: "value" });
  const connected = connections.length > 0;
  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id="value" style={{ top: "50%", marginLeft: "-11px" }} />
      <span className="handle-label">In</span>
      {!connected && (
        <textarea
          className="node-textarea"
          rows={3}
          value={data.jsonValue || ""}
          onChange={(e) => updateNodeData(id, { jsonValue: e.target.value })}
          placeholder={op === "template" ? '{"name": "${varName}"}' : '{"key": "value"} or connect input'}
        />
      )}
    </div>
  );
}

export default function JsonNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const op = data.jsonOp || "parse";

  return (
    <div className={`node json-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        JSON
        <Handle type="source" position={Position.Right} id="result" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <select className="node-select" value={op} onChange={(e) => updateNodeData(id, { jsonOp: e.target.value })}>
          {JSON_OPS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <JsonInputRow id={id} data={data} updateNodeData={updateNodeData} op={op} />
        {(op === "get" || op === "set") && (
          <input
            className="node-input"
            value={data.path || ""}
            onChange={(e) => updateNodeData(id, { path: e.target.value })}
            placeholder="dot.path.key"
          />
        )}
        {op === "set" && (
          <input
            className="node-input"
            value={data.setValue || ""}
            onChange={(e) => updateNodeData(id, { setValue: e.target.value })}
            placeholder="new value"
          />
        )}
        {result !== undefined && (
          <div className="node-result">{typeof result === "object" ? JSON.stringify(result) : String(result)}</div>
        )}
      </div>
    </div>
  );
}
