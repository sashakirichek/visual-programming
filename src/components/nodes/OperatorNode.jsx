import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

const OPERATORS = ['+', '-', '*', '/', '%', '**', '===', '!==', '>', '<', '>=', '<=', '&&', '||', '??'];

export default function OperatorNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node operator-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="a" style={{ top: '38%' }} />
      <Handle type="target" position={Position.Left} id="b" style={{ top: '62%' }} />
      <div className="node-header">⚙️ Operator</div>
      <div className="node-body">
        <div className="node-row">
          <span className="handle-label">A</span>
          <input
            className="node-input small"
            value={data.aValue || ''}
            onChange={(e) => updateNodeData(id, { aValue: e.target.value })}
            placeholder="or connect"
          />
        </div>
        <select
          className="node-select"
          value={data.operator || '+'}
          onChange={(e) => updateNodeData(id, { operator: e.target.value })}
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        <div className="node-row">
          <span className="handle-label">B</span>
          <input
            className="node-input small"
            value={data.bValue || ''}
            onChange={(e) => updateNodeData(id, { bValue: e.target.value })}
            placeholder="or connect"
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
