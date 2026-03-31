import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { FUNCTION_META, CATEGORIES } from "../../data/functionMeta";

function ParamRow({ id, index, param, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: `arg${index}` });
  const connected = connections.length > 0;

  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id={`arg${index}`} style={{ top: "50%", marginLeft: "-11px" }} />
      <span className="handle-label">{param.name}</span>
      {!connected && (
        <input
          className={`node-input small${param.isCallback ? " callback-input" : ""}`}
          value={data[`arg${index}`] || ""}
          onChange={(e) => updateNodeData(id, { [`arg${index}`]: e.target.value })}
          placeholder={param.isCallback ? param.desc || "(x) => x" : param.desc || "or connect"}
        />
      )}
    </div>
  );
}

export default function FunctionNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const meta = FUNCTION_META[data.functionName] || null;
  const params = meta?.params || [];

  return (
    <div className={`node function-node ${selected ? "selected" : ""}`}>
      {/* {params.length === 0 && !meta && (
        <Handle type="target" position={Position.Left} id="arg0" style={{ top: "50%" }} />
      )} */}
      <div className="node-header">
        FUNCTION
        <Handle type="source" position={Position.Right} id="result" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <select
          className="node-select"
          value={data.functionName || ""}
          onChange={(e) => updateNodeData(id, { functionName: e.target.value })}
        >
          <option value="">-- Select --</option>
          {Object.entries(CATEGORIES).map(([cat, fns]) => (
            <optgroup key={cat} label={cat}>
              {fns.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {meta && <div className="node-desc">{meta.desc}</div>}
        {params.map((p, i) => (
          <ParamRow key={i} id={id} index={i} param={p} data={data} updateNodeData={updateNodeData} />
        ))}
        {result !== undefined && (
          <div className="node-result">{typeof result === "object" ? JSON.stringify(result) : String(result)}</div>
        )}
      </div>
    </div>
  );
}
