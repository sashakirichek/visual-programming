import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { FUNCTION_META, CATEGORIES } from "../../data/functionMeta";
import { formatValue, getClosureCount } from "../../utils/valueUtils";

function ParamRow({ id, index, param, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: `arg${index}` });
  const connected = connections.length > 0;
  const inputValue = data[`arg${index}`] || "";
  const isMultiline = param.isCallback || inputValue.includes("\n") || inputValue.length > 56;

  return (
    <div className={`node-row${isMultiline ? " node-row-stack" : ""}`} style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id={`arg${index}`} style={{ top: "50%", marginLeft: "-10px" }} />
      <span className="handle-label">{param.name}</span>
      {!connected &&
        (isMultiline ? (
          <textarea
            className={`node-textarea node-param-textarea${param.isCallback ? " callback-input" : ""}`}
            rows={param.isCallback ? 4 : 3}
            value={inputValue}
            onChange={(e) => updateNodeData(id, { [`arg${index}`]: e.target.value })}
            placeholder={param.isCallback ? param.desc || "(x) => x" : param.desc || "or connect"}
          />
        ) : (
          <input
            className="node-input small"
            value={inputValue}
            onChange={(e) => updateNodeData(id, { [`arg${index}`]: e.target.value })}
            placeholder={param.isCallback ? param.desc || "(x) => x" : param.desc || "or connect"}
          />
        ))}
    </div>
  );
}

function BindingRow({ id, index, data, updateNodeData, onRemove }) {
  const connections = useHandleConnections({ type: "target", id: `bind${index}` });
  const connected = connections.length > 0;

  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id={`bind${index}`} style={{ top: "50%", marginLeft: "-10px" }} />
      <input
        className="node-input small"
        style={{ maxWidth: 68 }}
        value={data[`bindName${index}`] || ""}
        onChange={(e) => updateNodeData(id, { [`bindName${index}`]: e.target.value })}
        placeholder="name"
      />
      {!connected && (
        <input
          className="node-input small"
          value={data[`bind${index}`] || ""}
          onChange={(e) => updateNodeData(id, { [`bind${index}`]: e.target.value })}
          placeholder="value or connect"
        />
      )}
      <button type="button" className="node-action-btn compact" onClick={onRemove} title="Remove closure">
        x
      </button>
    </div>
  );
}

function getClosureRemovalPatch(data, removeIndex) {
  const closureCount = getClosureCount(data);
  const nextPatch = { closureCount: Math.max(closureCount - 1, 0) };

  for (let index = removeIndex; index < closureCount - 1; index++) {
    nextPatch[`bindName${index}`] = data[`bindName${index + 1}`] || "";
    nextPatch[`bind${index}`] = data[`bind${index + 1}`] || "";
  }

  nextPatch[`bindName${closureCount - 1}`] = "";
  nextPatch[`bind${closureCount - 1}`] = "";

  return nextPatch;
}

export default function FunctionNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const meta = FUNCTION_META[data.functionName] || null;
  const params = meta?.params || [];
  const hasCallback = params.some((p) => p.isCallback);
  const closureCount = hasCallback ? getClosureCount(data) : 0;

  return (
    <div className={`node function-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      {/* {params.length === 0 && !meta && (
        <Handle type="target" position={Position.Left} id="arg0" style={{ top: "50%" }} />
      )} */}
      <div className="node-header drag-handle">
        FUNCTION
        <Handle type="source" position={Position.Right} id="result" className="nodrag" style={{ top: "50%" }} />
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
        {hasCallback && (
          <div className="closure-section">
            <div className="closure-toolbar">
              <div className="node-desc">closures (name -&gt; value)</div>
              <button
                type="button"
                className="node-action-btn"
                onClick={() => updateNodeData(id, { closureCount: closureCount + 1 })}
              >
                + add closure
              </button>
            </div>
            {Array.from({ length: closureCount }, (_, index) => (
              <BindingRow
                key={index}
                id={id}
                index={index}
                data={data}
                updateNodeData={updateNodeData}
                onRemove={() => updateNodeData(id, getClosureRemovalPatch(data, index))}
              />
            ))}
          </div>
        )}
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
