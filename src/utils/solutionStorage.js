const STORAGE_KEY = "vp_solutions";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeAll(solutions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solutions));
}

export function getSolutions() {
  return readAll();
}

export function saveSolution({ name, notes, flow, challengeId }) {
  const solutions = readAll();
  solutions.push({
    id: `sol_${Date.now()}`,
    name,
    notes: notes || "",
    flow,
    challengeId: challengeId || null,
    createdAt: new Date().toISOString(),
  });
  writeAll(solutions);
}

export function deleteSolution(id) {
  const solutions = readAll().filter((s) => s.id !== id);
  writeAll(solutions);
}

export function updateSolutionNotes(id, notes) {
  const solutions = readAll().map((s) => (s.id === id ? { ...s, notes } : s));
  writeAll(solutions);
}

export function clearAllSolutions() {
  localStorage.removeItem(STORAGE_KEY);
}
