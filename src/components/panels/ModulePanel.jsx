import { useState } from "react";
import { useFlowStore } from "../../store/flowStore";

export default function ModulePanel() {
  const modules = useFlowStore((s) => s.modules);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const saveModule = useFlowStore((s) => s.saveModule);
  const deleteModule = useFlowStore((s) => s.deleteModule);
  const loadModuleAsNodes = useFlowStore((s) => s.loadModuleAsNodes);

  const [moduleName, setModuleName] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [expanded, setExpanded] = useState(null);

  const handleSave = () => {
    if (!moduleName.trim()) return;
    saveModule(moduleName.trim(), {
      name: moduleName.trim(),
      description: moduleDesc,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    });
    setModuleName("");
    setModuleDesc("");
  };

  return (
    <div className="module-panel">
      <div className="panel-title">MODULES</div>

      <div className="module-save-form">
        <input
          className="module-input"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          placeholder="Module name..."
        />
        <input
          className="module-input"
          value={moduleDesc}
          onChange={(e) => setModuleDesc(e.target.value)}
          placeholder="Description (optional)"
        />
        <button className="btn btn-primary" onClick={handleSave} disabled={!moduleName.trim()}>
          SAVE FLOW AS MODULE
        </button>
      </div>

      <div className="module-list">
        {Object.entries(modules).length === 0 && <div className="empty-message">No modules saved yet</div>}
        {Object.entries(modules).map(([name, mod]) => (
          <div key={name} className="module-item">
            <div className="module-item-header" onClick={() => setExpanded(expanded === name ? null : name)}>
              <span>MOD: {name}</span>
              <span className="module-arrow">{expanded === name ? "▲" : "▼"}</span>
            </div>
            {expanded === name && (
              <div className="module-item-body">
                {mod.description && <p className="module-desc">{mod.description}</p>}
                <p className="module-meta">
                  {mod.nodes?.length || 0} nodes · {mod.edges?.length || 0} edges
                </p>
                <p className="module-meta">Saved: {new Date(mod.createdAt).toLocaleString()}</p>
                <div className="module-actions">
                  <button className="btn btn-secondary" onClick={() => loadModuleAsNodes(name)}>
                    LOAD
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteModule(name)}>
                    DEL
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
