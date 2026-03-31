import { useFlowStore } from "../../store/flowStore";
import { EXAMPLES } from "../../data/examples";

export default function ExamplesPanel() {
  const importFromJson = useFlowStore((s) => s.importFromJson);

  const handleLoad = (example) => {
    importFromJson(JSON.stringify(example.flow));
  };

  return (
    <div className="examples-panel">
      <div className="panel-title">EXAMPLES</div>
      {EXAMPLES.map((ex) => (
        <div key={ex.id} className="example-item">
          <div className="example-title">{ex.title}</div>
          <div className="example-meta">
            <span className={`difficulty-badge ${ex.difficulty}`}>{ex.difficulty}</span>
            <div className="example-tags">
              {ex.tags.map((t) => (
                <span key={t} className="example-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="example-desc">{ex.description}</div>
          <div className="example-actions">
            <button className="btn btn-secondary" onClick={() => handleLoad(ex)}>
              LOAD
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
