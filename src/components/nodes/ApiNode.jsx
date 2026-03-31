import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";

const METHODS = ["GET", "POST", "PUT", "DELETE"];

function BodyRow({ id, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: "body" });
  const connected = connections.length > 0;
  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id="body" style={{ top: "50%", marginLeft: "-10px" }} />
      <span className="handle-label">Body</span>
      {!connected && (
        <textarea
          className="node-textarea"
          rows={2}
          value={data.body || ""}
          onChange={(e) => updateNodeData(id, { body: e.target.value })}
          placeholder="Body JSON or connect input"
        />
      )}
    </div>
  );
}

export default function ApiNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node api-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        API
        <Handle type="source" position={Position.Right} id="result" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <select
          className="node-select"
          value={data.method || "GET"}
          onChange={(e) => updateNodeData(id, { method: e.target.value })}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className="node-input"
          value={data.url || ""}
          onChange={(e) => updateNodeData(id, { url: e.target.value })}
          placeholder="https://api.example.com/data"
        />
        <input
          className="node-input"
          value={data.headers || ""}
          onChange={(e) => updateNodeData(id, { headers: e.target.value })}
          placeholder='Headers: {"key": "val"}'
        />
        {(data.method === "POST" || data.method === "PUT") && (
          <BodyRow id={id} data={data} updateNodeData={updateNodeData} />
        )}
        {result !== undefined && (
          <div className="node-result">
            {typeof result === "string" && result.startsWith("Error")
              ? result
              : typeof result === "object"
                ? JSON.stringify(result).slice(0, 80) + (JSON.stringify(result).length > 80 ? "..." : "")
                : String(result)}
          </div>
        )}
      </div>
    </div>
  );
}
