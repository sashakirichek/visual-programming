import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';

export default function ModuleNode({ id, data, selected }) {
  const executionResults = useFlowStore((s) => s.executionResults);
  const result = executionResults[id];

  return (
    <div className={`node module-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">📦 Module</div>
      <div className="node-body">
        <div className="module-name">{data.moduleName || 'Unnamed Module'}</div>
        {data.description && (
          <div className="module-description">{data.description}</div>
        )}
        {result !== undefined && (
          <div className="node-result">{JSON.stringify(result)}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}
