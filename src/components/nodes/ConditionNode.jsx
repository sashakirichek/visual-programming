import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

export default function ConditionNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node condition-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="condition" style={{ top: '25%' }} />
      <Handle type="target" position={Position.Left} id="true" style={{ top: '55%' }} />
      <Handle type="target" position={Position.Left} id="false" style={{ top: '80%' }} />
      <div className="node-header">🔀 Condition (if)</div>
      <div className="node-body">
        <div className="node-row">
          <span className="handle-label">Cond</span>
          <input
            className="node-input small"
            value={data.condition || ''}
            onChange={(e) => updateNodeData(id, { condition: e.target.value })}
            placeholder="or connect"
          />
        </div>
        <div className="node-row">
          <span className="handle-label">✓ True</span>
          <input
            className="node-input small"
            value={data.trueValue || ''}
            onChange={(e) => updateNodeData(id, { trueValue: e.target.value })}
            placeholder="true value"
          />
        </div>
        <div className="node-row">
          <span className="handle-label">✗ False</span>
          <input
            className="node-input small"
            value={data.falseValue || ''}
            onChange={(e) => updateNodeData(id, { falseValue: e.target.value })}
            placeholder="false value"
          />
        </div>
        {result !== undefined && (
          <div className="node-result">{JSON.stringify(result)}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="result" />
    </div>
  );
}
