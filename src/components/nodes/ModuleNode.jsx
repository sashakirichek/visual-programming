import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import { formatValue } from "../../utils/valueUtils";

export default function ModuleNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const modules = useFlowStore((s) => s.modules);
  const loadModuleAsNodes = useFlowStore((s) => s.loadModuleAsNodes);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const [expanded, setExpanded] = useState(false);
  const moduleNames = Object.keys(modules);
  const selected_mod = modules[data.moduleName];

  return (
    <div className={`node module-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      <Handle type="target" position={Position.Left} id="input" style={{ marginLeft: "-10px" }} />
      <div className="node-header drag-handle">
        MODULE
        <button
          type="button"
          className="node-action-btn compact nodrag"
          style={{ marginLeft: "auto", lineHeight: 1 }}
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Collapse module details" : "Expand module details"}
        >
          {expanded ? "▲" : "▼"}
        </button>
        <Handle type="source" position={Position.Right} id="output" className="nodrag" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <select
          className="node-select"
          value={data.moduleName || ""}
          onChange={(e) => updateNodeData(id, { moduleName: e.target.value })}
        >
          <option value="">-- Pick module --</option>
          {moduleNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {expanded && selected_mod && (
          <div className="module-detail">
            {selected_mod.description && <div className="module-detail-desc">{selected_mod.description}</div>}
            <div className="module-detail-meta">
              {selected_mod.nodes?.length || 0} nodes · {selected_mod.edges?.length || 0} edges
            </div>
            <div className="module-detail-nodes">
              {(selected_mod.nodes || []).map((n, i) => (
                <span key={i} className="module-detail-chip">
                  {n.type?.replace("Node", "")}
                </span>
              ))}
            </div>
            <button
              className="module-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                loadModuleAsNodes(data.moduleName);
              }}
            >
              EXPAND INTO GRAPH
            </button>
          </div>
        )}
        {!expanded && selected_mod && (
          <div className="module-detail-meta">
            {selected_mod.nodes?.length || 0}N · {selected_mod.edges?.length || 0}E
          </div>
        )}
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
