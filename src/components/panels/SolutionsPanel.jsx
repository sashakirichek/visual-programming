import { useState, useEffect } from "react";
import { useFlowStore } from "../../store/flowStore";
import {
  getSolutions,
  saveSolution,
  deleteSolution,
  updateSolutionNotes,
  clearAllSolutions,
} from "../../utils/solutionStorage";

export default function SolutionsPanel() {
  const [solutions, setSolutions] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  const exportToJson = useFlowStore((s) => s.exportToJson);
  const importFromJson = useFlowStore((s) => s.importFromJson);
  const activeChallenge = useFlowStore((s) => s.activeChallenge);

  const refresh = () => setSolutions(getSolutions());
  useEffect(refresh, []);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const flow = exportToJson();
    saveSolution({
      name: saveName.trim(),
      notes: saveNotes.trim(),
      flow,
      challengeId: activeChallenge?.id || null,
    });
    setSaveName("");
    setSaveNotes("");
    refresh();
  };

  const handleLoad = (sol) => {
    importFromJson(sol.flow);
  };

  const handleDelete = (id) => {
    deleteSolution(id);
    refresh();
  };

  const handleClearAll = () => {
    clearAllSolutions();
    refresh();
  };

  const handleEditNotes = (sol) => {
    setEditingId(sol.id);
    setEditNotes(sol.notes);
  };

  const handleSaveNotes = () => {
    if (editingId) {
      updateSolutionNotes(editingId, editNotes);
      setEditingId(null);
      setEditNotes("");
      refresh();
    }
  };

  return (
    <div className="solutions-panel" data-testid="solutions-panel">
      <div className="panel-header">SOLUTIONS</div>

      <div className="save-form">
        <input
          className="input-field"
          placeholder="Solution name"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
        />
        <textarea
          className="input-field"
          placeholder="Notes (optional)"
          rows={2}
          value={saveNotes}
          onChange={(e) => setSaveNotes(e.target.value)}
        />
        <button className="toolbar-btn" data-testid="save-current-solution" onClick={handleSave}>
          SAVE CURRENT
        </button>
      </div>

      {solutions.length > 0 && (
        <>
          <div className="solution-list">
            {solutions.map((sol) => (
              <div key={sol.id} className="solution-item">
                <div className="solution-header">
                  <span className="solution-name">{sol.name}</span>
                  <span className="solution-date">{new Date(sol.createdAt).toLocaleDateString()}</span>
                </div>
                {sol.challengeId && <div className="solution-challenge">Challenge: {sol.challengeId}</div>}
                {editingId === sol.id ? (
                  <div className="edit-notes">
                    <textarea
                      className="input-field"
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                    <button className="toolbar-btn" onClick={handleSaveNotes}>
                      OK
                    </button>
                    <button className="toolbar-btn" onClick={() => setEditingId(null)}>
                      CANCEL
                    </button>
                  </div>
                ) : (
                  sol.notes && <div className="solution-notes">{sol.notes}</div>
                )}
                <div className="solution-actions">
                  <button className="toolbar-btn" onClick={() => handleLoad(sol)}>
                    LOAD
                  </button>
                  <button className="toolbar-btn" onClick={() => handleEditNotes(sol)}>
                    NOTES
                  </button>
                  <button className="toolbar-btn" onClick={() => handleDelete(sol.id)}>
                    DEL
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="toolbar-btn clear-btn" onClick={handleClearAll}>
            CLEAR ALL
          </button>
        </>
      )}

      {solutions.length === 0 && <div className="empty-state">No saved solutions</div>}
    </div>
  );
}
