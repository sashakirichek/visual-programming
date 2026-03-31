import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

export default function VariableNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node variable-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="value" />
      <div className="node-header">📦 Variable</div>
      <div className="node-body">
        <div className="node-row">
          <label>Name:</label>
          <input
            className="node-input small"
            value={data.name || ''}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
            placeholder="varName"
          />
        </div>
        <div className="node-row">
          <label>Value:</label>
          <input
            className="node-input small"
            value={data.value || ''}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
            placeholder="or connect"
          />
        </div>
        {result !== undefined && (
          <div className="node-result">{JSON.stringify(result)}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </div>
  );
}
