import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

export default function InputNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node input-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">📥 Input</div>
      <div className="node-body">
        <label>Value:</label>
        <input
          className="node-input"
          value={data.value || ''}
          onChange={(e) => updateNodeData(id, { value: e.target.value })}
          placeholder="Enter value..."
        />
        {result !== undefined && (
          <div className="node-result">{JSON.stringify(result)}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </div>
  );
}
