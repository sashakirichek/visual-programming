import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

const LOOP_OPS = ['forEach', 'map', 'filter'];

export default function LoopNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node loop-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="array" />
      <div className="node-header">🔄 Loop</div>
      <div className="node-body">
        <select
          className="node-select"
          value={data.loopOp || 'forEach'}
          onChange={(e) => updateNodeData(id, { loopOp: e.target.value })}
        >
          {LOOP_OPS.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        <div className="node-row">
          <label>Array:</label>
          <input
            className="node-input small"
            value={data.array || ''}
            onChange={(e) => updateNodeData(id, { array: e.target.value })}
            placeholder="[1,2,3] or connect"
          />
        </div>
        {result !== undefined && (
          <div className="node-result">
            {Array.isArray(result) ? `[${result.join(', ')}]` : String(result)}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="result" />
    </div>
  );
}
