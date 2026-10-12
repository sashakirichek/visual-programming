import { Handle, Position, useNodeConnections } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';
import { formatValue, getClosureCount } from '../../utils/valueUtils';
import { getHandleColor } from '../../utils/typeChecker';
import ResizableNodeSelected from '../ResizableNodeSelected';

function LoopControlRow({ id, handleId, label, data, updateNodeData, fallback }) {
  const connections = useNodeConnections({ handleType: 'target', handleId });
  const connected = connections.length > 0;

  return (
    <div className="node-row" style={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        id={handleId}
        style={{ top: '50%', marginLeft: '-10px', backgroundColor: getHandleColor('number') }}
        data-type="number"
      />
      <span className="handle-label">{label}</span>
      {!connected && (
        <input
          className="node-input small"
          value={data[handleId] ?? fallback}
          onChange={(event) => updateNodeData(id, { [handleId]: event.target.value })}
          placeholder={fallback}
        />
      )}
    </div>
  );
}

function BindingRow({ id, index, data, updateNodeData, onRemove }) {
  const connections = useNodeConnections({ handleType: 'target', handleId: `bind${index}` });
  const connected = connections.length > 0;

  return (
    <div className="node-row" style={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Left}
        id={`bind${index}`}
        style={{ top: '50%', marginLeft: '-10px', backgroundColor: getHandleColor('any') }}
        data-type="any"
      />
      <input
        className="node-input small"
        style={{ maxWidth: 68 }}
        value={data[`bindName${index}`] || ''}
        onChange={(event) => updateNodeData(id, { [`bindName${index}`]: event.target.value })}
        placeholder="name"
      />
      {!connected && (
        <input
          className="node-input small"
          value={data[`bind${index}`] || ''}
          onChange={(event) => updateNodeData(id, { [`bind${index}`]: event.target.value })}
          placeholder="value or connect"
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        id={`closure${index}`}
        style={{ top: '50%', backgroundColor: getHandleColor('any') }}
        data-type="any"
      />
      <button type="button" className="node-action-btn compact" onClick={onRemove} title="Remove closure">
        x
      </button>
    </div>
  );
}

function getClosureRemovalPatch(data, removeIndex) {
  const closureCount = getClosureCount(data);
  const nextPatch = { closureCount: Math.max(closureCount - 1, 0) };

  for (let index = removeIndex; index < closureCount - 1; index++) {
    nextPatch[`bindName${index}`] = data[`bindName${index + 1}`] || '';
    nextPatch[`bind${index}`] = data[`bind${index + 1}`] || '';
  }

  nextPatch[`bindName${closureCount - 1}`] = '';
  nextPatch[`bind${closureCount - 1}`] = '';

  return nextPatch;
}

export default function FlowForLoopNode({ id, data, selected, width, height }) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const executionResults = useFlowStore((state) => state.executionResults);
  const result = executionResults[id];
  const closureCount = getClosureCount(data);

  return (
    <div
      className={`node loop-node flow-for-loop-node ${selected ? 'selected' : ''}`}
      style={{ width: width || 760, height: height || 480 }}
    >
      <ResizableNodeSelected isVisible={selected} resizeDirection={undefined} />
      <div className="node-header drag-handle">
        FOR LOOP
        <Handle
          type="source"
          position={Position.Right}
          id="result"
          className="nodrag"
          style={{ top: '50%', backgroundColor: getHandleColor('array') }}
          data-type="array"
        />
      </div>
      <div className="flow-loop-content">
        <div className="flow-loop-controls">
          <div>
            <LoopControlRow
              id={id}
              handleId="start"
              label="start"
              data={data}
              updateNodeData={updateNodeData}
              fallback="0"
            />
          </div>
          <div>
            <LoopControlRow
              id={id}
              handleId="limit"
              label="limit"
              data={data}
              updateNodeData={updateNodeData}
              fallback="10"
            />
          </div>
          <div>
            <LoopControlRow
              id={id}
              handleId="step"
              label="step"
              data={data}
              updateNodeData={updateNodeData}
              fallback="1"
            />
          </div>
        </div>

        <div className="flow-loop-inputs">
          <div className="flow-loop-index-row">
            <span className="handle-label">index</span>
            <Handle
              type="source"
              position={Position.Right}
              id="index"
              style={{ top: '50%', backgroundColor: getHandleColor('number') }}
              data-type="number"
            />
          </div>
          <div className="closure-section flow-loop-closures">
            <div className="closure-toolbar">
              <div className="node-desc">closures</div>
              <button
                type="button"
                className="node-action-btn"
                onClick={() => updateNodeData(id, { closureCount: closureCount + 1 })}
              >
                + add
              </button>
            </div>
            {Array.from({ length: closureCount }, (_, index) => (
              <BindingRow
                key={index}
                id={id}
                index={index}
                data={data}
                updateNodeData={updateNodeData}
                onRemove={() => updateNodeData(id, getClosureRemovalPatch(data, index))}
              />
            ))}
          </div>
        </div>

        <div className="flow-loop-body-output">
          <span className="handle-label">body output</span>
          <Handle
            type="target"
            position={Position.Left}
            id="body"
            style={{ top: '50%', backgroundColor: getHandleColor('any') }}
            data-type="any"
          />
        </div>
        {result !== undefined && <div className="node-result">{formatValue(result)}</div>}
      </div>
    </div>
  );
}
