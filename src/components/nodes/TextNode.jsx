import { useFlowStore } from "../../store/flowStore";
import ResizableNodeSelected from "../ResizableNodeSelected";

export default function TextNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const text = data?.text;

  return (
    <div className={`plain-node ${selected ? "selected" : ""}`}>
      <ResizableNodeSelected resizeDirection={null} color={selected ? "#fc55fc" : "transparent"} isVisible={selected} />
      <div className="drag-handle" style={{ padding: 0 }}>
        <textarea
          className="node-textarea"
          value={text}
          placeholder="Enter text"
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--label-primary)",
            resize: "none",
          }}
        />
      </div>
    </div>
  );
}
