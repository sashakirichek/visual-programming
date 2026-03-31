import { useFlowStore } from '../../store/flowStore';

const NODE_TYPES = [
  { type: 'inputNode', label: 'IN  Input', color: '#888', description: 'Static value input' },
  { type: 'outputNode', label: 'OUT  Output', color: '#666', description: 'Display result' },
  { type: 'variableNode', label: 'VAR  Variable', color: '#999', description: 'Named variable' },
  { type: 'operatorNode', label: 'OP  Operator', color: '#aaa', description: 'Math/logic operator' },
  { type: 'functionNode', label: 'FN  Function', color: '#777', description: 'Built-in function' },
  { type: 'conditionNode', label: 'IF  Condition', color: '#bbb', description: 'If/else branch' },
  { type: 'loopNode', label: 'LP  Loop', color: '#555', description: 'Array iteration' },
  { type: 'jsonNode', label: 'JS  JSON', color: '#444', description: 'JSON operations' },
  { type: 'apiNode', label: 'API  API Query', color: '#555', description: 'Fetch from external API' },
  { type: 'scopeNode', label: 'SC  Scope', color: '#fff', description: 'Function scope region' },
];

let nodeCounter = 0;

export default function NodePalette({ modules }) {
  const addNode = useFlowStore((s) => s.addNode);
  const loadModuleAsNodes = useFlowStore((s) => s.loadModuleAsNodes);

  const handleAddNode = (type) => {
    nodeCounter++;
    const id = `${type}_${Date.now()}_${nodeCounter}`;
    const nodeData = {
      id,
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: type },
    };
    if (type === 'scopeNode') {
      nodeData.style = { width: 400, height: 250 };
      nodeData.data = { label: type, name: '', scopeType: 'function', depth: 1 };
    }
    addNode(nodeData);
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
            style={{ borderLeftColor: color }}
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
              <span className="palette-label">MOD: {name}</span>
              <span className="palette-desc">Click to load</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
