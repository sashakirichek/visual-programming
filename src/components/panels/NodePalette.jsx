import { useFlowStore } from '../../store/flowStore';

const NODE_TYPES = [
  { type: 'inputNode', label: '📥 Input', color: '#4caf50', description: 'Static value input' },
  { type: 'outputNode', label: '📤 Output', color: '#2196f3', description: 'Display result' },
  { type: 'variableNode', label: '📦 Variable', color: '#9c27b0', description: 'Named variable' },
  { type: 'operatorNode', label: '⚙️ Operator', color: '#ff9800', description: 'Math/logic operator' },
  { type: 'functionNode', label: 'ƒ Function', color: '#e91e63', description: 'Built-in function' },
  { type: 'conditionNode', label: '🔀 Condition', color: '#009688', description: 'If/else branch' },
  { type: 'loopNode', label: '🔄 Loop', color: '#795548', description: 'Array iteration' },
  { type: 'jsonNode', label: '📄 JSON', color: '#607d8b', description: 'JSON operations' },
];

let nodeCounter = 0;

export default function NodePalette({ modules }) {
  const addNode = useFlowStore((s) => s.addNode);
  const loadModuleAsNodes = useFlowStore((s) => s.loadModuleAsNodes);

  const handleAddNode = (type) => {
    nodeCounter++;
    const id = `${type}_${Date.now()}_${nodeCounter}`;
    addNode({
      id,
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: type },
    });
  };

  const handleLoadModule = (moduleName) => {
    loadModuleAsNodes(moduleName);
  };

  return (
    <div className="node-palette">
      <div className="palette-section">
        <div className="palette-title">Nodes</div>
        {NODE_TYPES.map(({ type, label, color, description }) => (
          <div
            key={type}
            className="palette-item"
            style={{ borderLeft: `4px solid ${color}` }}
            onClick={() => handleAddNode(type)}
            title={description}
          >
            <span className="palette-label">{label}</span>
            <span className="palette-desc">{description}</span>
          </div>
        ))}
      </div>

      {modules && Object.keys(modules).length > 0 && (
        <div className="palette-section">
          <div className="palette-title">Modules</div>
          {Object.keys(modules).map((name) => (
            <div
              key={name}
              className="palette-item module-palette-item"
              onClick={() => handleLoadModule(name)}
              title={`Load module: ${name}`}
            >
              <span className="palette-label">📦 {name}</span>
              <span className="palette-desc">Click to load</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
