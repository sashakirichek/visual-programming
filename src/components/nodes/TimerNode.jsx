import { Handle, Position } from "@xyflow/react";
import { useFlowStore } from "../../store/flowStore";
import ResizableNodeSelected from "../ResizableNodeSelected";

export default function TimerNode({ id, data, selected, width }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <div className={`node timer-node ${selected ? "selected" : ""}`} style={width ? { width } : undefined}>
      <ResizableNodeSelected isVisible={selected} />
      <div className="node-header drag-handle">
        TIMER
        <Handle type="source" position={Position.Right} id="tick" className="nodrag" style={{ top: "50%" }} />
      </div>
      <div className="node-body">
        <div className="node-row">
          <label>Interval (ms)</label>
          <input
            className="node-input small"
            value={data.interval ?? 1000}
            onChange={(e) => updateNodeData(id, { interval: Number(e.target.value) || 0 })}
            placeholder="1000"
            type="number"
          />
        </div>
        <div className="node-row">
          <label>Auto start</label>
          <input
            type="checkbox"
            checked={Boolean(data.autoStart)}
            onChange={(e) => updateNodeData(id, { autoStart: e.target.checked })}
          />
        </div>
      </div>
    </div>
  );
}
