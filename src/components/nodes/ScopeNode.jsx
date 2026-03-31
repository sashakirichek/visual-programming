import { Handle, Position, NodeResizer } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

const SCOPE_TYPES = ['function', 'block', 'closure'];

export default function ScopeNode({ id, data, selected }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const depth = data.depth || 1;
  const depthClass = `scope-depth-${Math.min(depth, 3)}`;

  return (
    <div className={`scope-node-container ${depthClass}`}>
      <NodeResizer
        minWidth={300}
        minHeight={200}
        isVisible={selected}
        lineStyle={{ borderColor: '#555' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 0, background: '#555' }}
      />
      <div className="scope-header">
        <div className="scope-label">
          <span>SCOPE:</span>
          <input
            className="node-input small"
            value={data.name || ''}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
            placeholder="scope name"
            style={{ background: 'transparent', border: 'none', color: '#aaa', width: '80px' }}
          />
        </div>
        <select
          className="node-select"
          value={data.scopeType || 'function'}
          onChange={(e) => updateNodeData(id, { scopeType: e.target.value })}
          style={{ width: 'auto', background: 'transparent', border: '1px solid #444', color: '#666', fontSize: '9px', padding: '1px 4px' }}
        >
          {SCOPE_TYPES.map((t) => (
            <option key={t} value={t}>{t.toUpperCase()}</option>
          ))}
        </select>
        <span className="scope-type-badge">{data.scopeType || 'function'}</span>
      </div>
      <Handle type="target" position={Position.Left} id="input" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%' }} />
    </div>
  );
}
