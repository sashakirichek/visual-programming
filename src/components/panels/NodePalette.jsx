import { useFlowStore } from "../../store/flowStore";

const NODE_TYPES = [
  { type: "inputNode", label: "IN  Input", color: "var(--sys-blue)", description: "Static value input" },
  { type: "outputNode", label: "OUT  Output", color: "var(--sys-purple)", description: "Display result" },
  { type: "variableNode", label: "VAR  Variable", color: "var(--sys-teal)", description: "Named variable" },
  { type: "operatorNode", label: "OP  Operator", color: "var(--sys-orange)", description: "Math/logic operator" },
  { type: "functionNode", label: "FN  Function", color: "var(--sys-green)", description: "Built-in function" },
  { type: "conditionNode", label: "IF  Condition", color: "var(--sys-yellow)", description: "If/else branch" },
  { type: "loopNode", label: "LP  Loop", color: "var(--sys-indigo)", description: "Array iteration" },
  { type: "jsonNode", label: "JS  JSON", color: "var(--sys-pink)", description: "JSON operations" },
  { type: "apiNode", label: "API  API Query", color: "var(--sys-red)", description: "Fetch from external API" },
  { type: "scopeNode", label: "GRP  Group", color: "var(--sys-gray)", description: "Visual group / save as module" },
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
    if (type === "scopeNode") {
      nodeData.style = { width: 400, height: 250 };
      nodeData.zIndex = -1;
      nodeData.dragHandle = ".drag-handle";
      nodeData.data = { label: type, name: "", color: "var(--sys-gray)" };
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
