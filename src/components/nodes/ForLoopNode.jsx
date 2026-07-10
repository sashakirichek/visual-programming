import { Handle, Position, useNodeConnections } from "@xyflow/react";
import { useState, useEffect, useRef } from "react";
import { useFlowStore } from "../../store/flowStore";
import { formatValue, getClosureCount } from "../../utils/valueUtils";
import { getHandleColor } from "../../utils/typeChecker";
import ResizableNodeSelected from "../ResizableNodeSelected";

const DEFAULTS = {
  start: "0",
  condition: "i < 10",
  iteration: "i++",
  body: "i",
};

export default function ForLoopNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const closureCount = getClosureCount(data);

  function BindingRow({ index }) {
    const connections = useNodeConnections({ type: "target", id: `bind${index}` });
    const connected = connections.length > 0;

    const [name, setName] = useState(data[`bindName${index}`] || "");
    const [value, setValue] = useState(data[`bind${index}`] || "");
    const nameRef = useRef(null);

    useEffect(() => {
      setName(data[`bindName${index}`] || "");
    }, [data, index]);

    useEffect(() => {
      setValue(data[`bind${index}`] || "");
    }, [data, index]);

    const commit = () => updateNodeData(id, { [`bindName${index}`]: name, [`bind${index}`]: value });

    const onNameKeyDown = (e) => {
      if (e.key === "Enter") {
        commit();
        nameRef.current?.blur();
      }
    };

    return (
      <div className="node-row" style={{ position: "relative" }}>
        <Handle
          type="target"
          position={Position.Left}
          id={`bind${index}`}
          style={{ top: "50%", marginLeft: "-10px", backgroundColor: getHandleColor("any") }}
          data-type="any"
        />
        <input
          ref={nameRef}
          className="node-input small"
          style={{ maxWidth: 68 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={onNameKeyDown}
          placeholder="name"
        />
        {!connected && (
          <input
            className="node-input small"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            placeholder="value or connect"
          />
        )}
        <button
          type="button"
          className="node-action-btn compact"
          onClick={() => {
            const next = Math.max(closureCount - 1, 0);
            const patch = { closureCount: next };
            for (let i = index; i < closureCount - 1; i++) {
              patch[`bindName${i}`] = data[`bindName${i + 1}`] || "";
              patch[`bind${i}`] = data[`bind${i + 1}`] || "";
            }
            patch[`bindName${closureCount - 1}`] = "";
            patch[`bind${closureCount - 1}`] = "";
            updateNodeData(id, patch);
          }}
          title="Remove closure"
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div className={`node loop-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      <ResizableNodeSelected isVisible={selected} />
      <div className="node-header drag-handle">
        FOR
        <Handle type="source" position={Position.Right} id="result" className="nodrag" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <div className="node-row node-row-stack">
          <label>Loop controls</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <input
              className="node-input small"
              value={data.start || ""}
              onChange={(e) => updateNodeData(id, { start: e.target.value })}
              placeholder={DEFAULTS.start}
              title="Start value for i"
            />
            <input
              className="node-input small"
              value={data.condition || ""}
              onChange={(e) => updateNodeData(id, { condition: e.target.value })}
              placeholder={DEFAULTS.condition}
              title="Loop condition expression using i"
            />
            <input
              className="node-input small"
              value={data.iteration || ""}
              onChange={(e) => updateNodeData(id, { iteration: e.target.value })}
              placeholder={DEFAULTS.iteration}
              title="Iteration expression to update i"
            />
          </div>
        </div>

        <div className="node-row node-row-stack">
          <label>Body</label>
          <textarea
            className="node-textarea node-param-textarea"
            rows={4}
            value={data.body || ""}
            onChange={(e) => updateNodeData(id, { body: e.target.value })}
            placeholder={DEFAULTS.body}
          />
        </div>

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
            <BindingRow key={index} index={index} />
          ))}
        </div>
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
