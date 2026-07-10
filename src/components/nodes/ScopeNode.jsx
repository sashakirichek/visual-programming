import { NodeResizer, Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import ResizableNodeSelected from "../ResizableNodeSelected";
import { setOpacity } from "../../utils/colorUtils";

const GROUP_COLORS = [
  { label: "Gray", value: "var(--sys-gray)" },
  { label: "Blue", value: "var(--sys-blue)" },
  { label: "Green", value: "var(--sys-green)" },
  { label: "Orange", value: "var(--sys-orange)" },
  { label: "Purple", value: "var(--sys-purple)" },
  { label: "Teal", value: "var(--sys-teal)" },
];

export default function ScopeNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const color = data.color || "var(--sys-gray)";

  return (
    <div className="group-node-container" style={{ borderColor: color, backgroundColor: setOpacity(color, 0.06) }}>
      <ResizableNodeSelected resizeDirection={undefined} isVisible={selected} />
      <div className="group-header drag-handle">
        <span className="group-color-dot" style={{ background: color }} />
        <input
          className="group-name-input nodrag"
          value={data.name || ""}
          onChange={(e) => updateNodeData(id, { name: e.target.value })}
          placeholder="label"
        />
        <select
          className="group-color-select nodrag"
          value={color}
          onChange={(e) => updateNodeData(id, { color: e.target.value })}
        >
          {GROUP_COLORS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
