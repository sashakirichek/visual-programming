import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

export default function OutputNode({ id, data, selected }) {
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  const displayValue = result !== undefined
    ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result))
    : '—';

  return (
    <div className={`node output-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="value" />
      <div className="node-header">📤 Output</div>
      <div className="node-body">
        <label>{data.label || 'Result'}:</label>
        <div className="node-result-box">{displayValue}</div>
      </div>
    </div>
  );
}
