import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

const CATEGORIES = {
  Math: ['abs', 'ceil', 'floor', 'round', 'sqrt', 'cbrt', 'log', 'log2', 'log10',
    'sin', 'cos', 'tan', 'min', 'max', 'pow', 'sign', 'trunc', 'random', 'PI', 'E'],
  String: ['length', 'toUpperCase', 'toLowerCase', 'trim', 'split', 'join',
    'includes', 'startsWith', 'endsWith', 'indexOf', 'slice', 'replace',
    'repeat', 'concat', 'toString', 'parseInt', 'parseFloat', 'Number', 'Boolean'],
  JSON: ['JSON_stringify', 'JSON_parse'],
  Array: ['map', 'filter', 'reduce', 'find', 'some', 'every', 'includes',
    'indexOf', 'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'concat',
    'flat', 'flatMap', 'sort', 'reverse', 'length', 'Array_from', 'Array_isArray'],
  Object: ['Object_keys', 'Object_values', 'Object_entries', 'Object_assign'],
};

const ALL_FUNCTIONS = Object.values(CATEGORIES).flat();

export default function FunctionNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node function-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="arg0" style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} id="arg1" style={{ top: '45%' }} />
      <Handle type="target" position={Position.Left} id="arg2" style={{ top: '60%' }} />
      <Handle type="target" position={Position.Left} id="arg3" style={{ top: '75%' }} />
      <div className="node-header">ƒ Function</div>
      <div className="node-body">
        <select
          className="node-select"
          value={data.functionName || ''}
          onChange={(e) => updateNodeData(id, { functionName: e.target.value })}
        >
          <option value="">-- Select --</option>
          {Object.entries(CATEGORIES).map(([cat, fns]) => (
            <optgroup key={cat} label={cat}>
              {fns.map((fn) => (
                <option key={fn} value={fn}>{fn}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="node-row">
            <span className="handle-label">Arg{i}</span>
            <input
              className="node-input small"
              value={data[`arg${i}`] || ''}
              onChange={(e) => updateNodeData(id, { [`arg${i}`]: e.target.value })}
              placeholder="or connect"
            />
          </div>
        ))}
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
