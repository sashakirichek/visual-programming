import { Handle, Position, useHandleConnections } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";

const DISPLAY_TYPES = ["inferred", "table", "gauge", "progress", "slider", "chart", "text"];

const OUTPUT_PARAMS = {
  gauge:    [{ id: "min", label: "Min", def: "0" }, { id: "max", label: "Max", def: "100" }, { id: "color", label: "Color", type: "color", def: "#00e5ff" }],
  progress: [{ id: "min", label: "Min", def: "0" }, { id: "max", label: "Max", def: "100" }, { id: "color", label: "Color", type: "color", def: "#00e5ff" }],
  slider:   [{ id: "min", label: "Min", def: "0" }, { id: "max", label: "Max", def: "100" }, { id: "color", label: "Color", type: "color", def: "#ffd600" }],
  chart:    [{ id: "color", label: "Color", type: "color", def: "#00e5ff" }],
};

const DATA_HINTS = {
  chart: "[num, \u2026] or {key: num, \u2026}",
  table: "[{col: val, \u2026}, \u2026] or {k: v, \u2026}",
};

function getTypeBadge(value) {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return "ARRAY";
  if (typeof value === "object") return "OBJECT";
  if (typeof value === "number") return "NUM";
  if (typeof value === "boolean") return "BOOL";
  if (typeof value === "string") return "STR";
  return null;
}

function inferDisplayType(value) {
  if (value === undefined || value === null) return "text";
  if (typeof value === "boolean") return "text";
  if (typeof value === "number") return "text";
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "object") return "table";
    return "table";
  }
  if (typeof value === "object") return "table";
  return "text";
}

function TableViz({ value }) {
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
    const keys = Object.keys(value[0]);
    return (
      <table className="output-table">
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((row, i) => (
            <tr key={i}>
              {keys.map((k) => (
                <td key={k}>{String(row[k] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  const arr = Array.isArray(value) ? value : Object.entries(value || {});
  return (
    <table className="output-table">
      <tbody>
        {arr.map((item, i) => (
          <tr key={i}>
            <td className="output-table-idx">{Array.isArray(value) ? i : item[0]}</td>
            <td>{Array.isArray(value) ? String(item) : String(item[1])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GaugeViz({ value, min = 0, max = 100, color }) {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  const ratio = Math.max(0, Math.min(1, (num - min) / (max - min || 1)));
  const angle = -90 + ratio * 180;
  return (
    <div className="output-gauge">
      <svg viewBox="0 0 120 70">
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#333" strokeWidth="6" />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color || "var(--accent-info)"}
          strokeWidth="4"
          strokeDasharray={`${ratio * 157} 157`}
        />
        <line
          x1="60"
          y1="60"
          x2={60 + 40 * Math.cos((angle * Math.PI) / 180)}
          y2={60 + 40 * Math.sin((angle * Math.PI) / 180)}
          stroke="#fff"
          strokeWidth="2"
        />
        <circle cx="60" cy="60" r="3" fill="#fff" />
      </svg>
      <div className="output-gauge-val">{num}</div>
    </div>
  );
}

function ProgressViz({ value, min = 0, max = 100, color }) {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  const pct = Math.max(0, Math.min(100, ((num - min) / (max - min || 1)) * 100));
  return (
    <div className="output-progress">
      <div className="output-progress-track">
        <div className="output-progress-fill" style={{ width: `${pct}%`, background: color || undefined }} />
      </div>
      <span className="output-progress-val">{num}</span>
    </div>
  );
}

function SliderViz({ value, min = 0, max = 100, color }) {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  const pct = Math.max(0, Math.min(100, ((num - min) / (max - min || 1)) * 100));
  return (
    <div className="output-slider">
      <div className="output-slider-track">
        <div className="output-slider-thumb" style={{ left: `${pct}%`, background: color || undefined }} />
      </div>
      <span className="output-slider-val">{num}</span>
    </div>
  );
}

function ChartViz({ value, color }) {
  const arr = Array.isArray(value)
    ? value.map((v) => (typeof v === "number" ? v : parseFloat(v) || 0))
    : typeof value === "object" && value
    ? Object.values(value).map((v) => (typeof v === "number" ? v : parseFloat(v) || 0))
    : [];
  if (arr.length === 0) return <span className="output-placeholder">No data</span>;
  const max = Math.max(...arr);
  const min = Math.min(...arr, 0);
  const range = max - min || 1;
  const labels = Array.isArray(value) ? null : Object.keys(value);
  return (
    <div className="output-chart">
      <div className="output-chart-bars">
        {arr.map((v, i) => (
          <div key={i} className="output-chart-col">
            <div
              className="output-chart-bar"
              style={{ height: `${((v - min) / range) * 100}%`, background: color || undefined }}
              title={labels ? `${labels[i]}: ${v}` : String(v)}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="output-chart-labels">
          {labels.map((l, i) => (
            <span key={i} className="output-chart-label">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function renderViz(displayType, value, min, max, color) {
  const effective = displayType === "inferred" ? inferDisplayType(value) : displayType;
  switch (effective) {
    case "table":
      return <TableViz value={value} />;
    case "gauge":
      return <GaugeViz value={value} min={min} max={max} color={color} />;
    case "progress":
      return <ProgressViz value={value} min={min} max={max} color={color} />;
    case "slider":
      return <SliderViz value={value} min={min} max={max} color={color} />;
    case "chart":
      return <ChartViz value={value} color={color} />;
    default: {
      const text =
        value !== undefined ? (typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)) : "—";
      return <pre className="node-result-box output-scrollable">{text}</pre>;
    }
  }
}

function OutputParamRow({ id, param, data, updateNodeData }) {
  const connections = useHandleConnections({ type: "target", id: param.id });
  const connected = connections.length > 0;

  return (
    <div className="node-row" style={{ position: "relative" }}>
      <Handle type="target" position={Position.Left} id={param.id} style={{ top: "50%", marginLeft: "-11px" }} />
      <span className="handle-label">{param.label}</span>
      {!connected &&
        (param.type === "color" ? (
          <input
            type="color"
            className="node-color-input"
            value={data[param.id] || param.def}
            onChange={(e) => updateNodeData(id, { [param.id]: e.target.value })}
          />
        ) : (
          <input
            className="node-input small"
            value={data[param.id] ?? param.def}
            onChange={(e) => updateNodeData(id, { [param.id]: e.target.value })}
            placeholder={param.def}
          />
        ))}
    </div>
  );
}

export default function OutputNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const edges = useFlowStore((s) => s.edges);
  const result = executionResults[id];
  const displayType = data.displayType || "inferred";
  const badge = getTypeBadge(result);
  const params = OUTPUT_PARAMS[displayType] || [];
  const hint = DATA_HINTS[displayType];

  const resolve = (key, fallback) => {
    const edge = edges.find((e) => e.target === id && e.targetHandle === key);
    if (edge && executionResults[edge.source] !== undefined) return executionResults[edge.source];
    return data[key] != null ? (typeof fallback === "number" ? Number(data[key]) : data[key]) : fallback;
  };

  const min = resolve("min", 0);
  const max = resolve("max", 100);
  const color = resolve("color", null);

  return (
    <div className={`node output-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} id="value" />
      <div className="node-header">
        OUTPUT
        {badge && <span className="type-badge">{badge}</span>}
      </div>
      <div className="node-body">
        <select
          className="node-select"
          value={displayType}
          onChange={(e) => updateNodeData(id, { displayType: e.target.value })}
        >
          {DISPLAY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {hint && <div className="output-hint">{hint}</div>}
        {params.map((p) => (
          <OutputParamRow key={p.id} id={id} param={p} data={data} updateNodeData={updateNodeData} />
        ))}
        {renderViz(displayType, result, min, max, color)}
      </div>
    </div>
  );
}
