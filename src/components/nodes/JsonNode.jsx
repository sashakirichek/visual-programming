import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

const JSON_OPS = ['parse', 'stringify', 'get', 'set'];

export default function JsonNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];
  const op = data.jsonOp || 'parse';

  return (
    <div className={`node json-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="value" />
      <div className="node-header">📄 JSON</div>
      <div className="node-body">
        <select
          className="node-select"
          value={op}
          onChange={(e) => updateNodeData(id, { jsonOp: e.target.value })}
        >
          {JSON_OPS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <textarea
          className="node-textarea"
          rows={3}
          value={data.jsonValue || ''}
          onChange={(e) => updateNodeData(id, { jsonValue: e.target.value })}
          placeholder='{"key": "value"} or connect input'
        />
        {(op === 'get' || op === 'set') && (
          <input
            className="node-input"
            value={data.path || ''}
            onChange={(e) => updateNodeData(id, { path: e.target.value })}
            placeholder="dot.path.key"
          />
        )}
        {op === 'set' && (
          <input
            className="node-input"
            value={data.setValue || ''}
            onChange={(e) => updateNodeData(id, { setValue: e.target.value })}
            placeholder="new value"
          />
        )}
        {result !== undefined && (
          <div className="node-result">
            {typeof result === 'object' ? JSON.stringify(result) : String(result)}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="result" />
    </div>
  );
}
