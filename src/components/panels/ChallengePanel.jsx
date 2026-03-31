import { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { executeGraph } from '../../utils/nodeExecutor';
import { CHALLENGES } from '../../data/challenges';

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(a[k], b[k]));
}

function validateStructure(nodes, edges, challenge) {
  const errors = [];
  const userNodes = nodes.filter((n) => !n.data?.locked);

  if (challenge.maxNodes && userNodes.length > challenge.maxNodes) {
    errors.push(`Too many nodes: ${userNodes.length} / max ${challenge.maxNodes}`);
  }

  const nodeTypes = userNodes.map((n) => n.type);
  for (const req of challenge.requiredNodeTypes || []) {
    if (!nodeTypes.includes(req)) {
      errors.push(`Missing required node type: ${req}`);
    }
  }

  for (const forbidden of challenge.forbiddenNodeTypes || []) {
    if (nodeTypes.includes(forbidden)) {
      errors.push(`Forbidden node type used: ${forbidden}`);
    }
  }

  // Output must be connected
  const outputNode = nodes.find((n) => n.id === 'challenge_output');
  if (outputNode) {
    const hasIncoming = edges.some((e) => e.target === outputNode.id);
    if (!hasIncoming) {
      errors.push('Output node is not connected');
    }
  }

  return errors;
}

function runTestCase(nodes, edges, testCase) {
  const testNodes = nodes.map((n) => {
    if (n.id.startsWith('challenge_input_')) {
      const idx = parseInt(n.id.split('_')[2], 10);
      return {
        ...n,
        data: { ...n.data, value: testCase.inputs[idx] ?? n.data.value },
      };
    }
    return n;
  });

  const { results } = executeGraph(testNodes, edges);
  const outputResult = results['challenge_output'];
  const passed = deepEqual(outputResult, testCase.expected)
    || String(outputResult) === String(testCase.expected);
  return { output: outputResult, expected: testCase.expected, passed };
}

export default function ChallengePanel() {
  const [showHints, setShowHints] = useState(false);

  const activeChallenge = useFlowStore((s) => s.activeChallenge);
  const challengeResults = useFlowStore((s) => s.challengeResults);
  const startChallenge = useFlowStore((s) => s.startChallenge);
  const exitChallenge = useFlowStore((s) => s.exitChallenge);
  const setChallengeResults = useFlowStore((s) => s.setChallengeResults);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);

  const handleSubmit = () => {
    const structErrors = validateStructure(nodes, edges, activeChallenge);
    if (structErrors.length > 0) {
      setChallengeResults({ passed: false, structErrors, testResults: [] });
      return;
    }

    const testResults = (activeChallenge.testCases || []).map((tc) =>
      runTestCase(nodes, edges, tc)
    );
    const allPassed = testResults.every((r) => r.passed);
    setChallengeResults({ passed: allPassed, structErrors: [], testResults });
  };

  if (activeChallenge) {
    return (
      <div className="challenge-panel">
        <div className="panel-header">CHALLENGE</div>
        <div className="challenge-active">
          <div className="challenge-title">{activeChallenge.title}</div>
          <span className={`difficulty-badge ${activeChallenge.difficulty}`}>
            {activeChallenge.difficulty.toUpperCase()}
          </span>
          <p className="challenge-desc">{activeChallenge.description}</p>

          <div className="challenge-constraints">
            {activeChallenge.maxNodes && (
              <div>Max nodes: {activeChallenge.maxNodes}</div>
            )}
            {activeChallenge.requiredNodeTypes?.length > 0 && (
              <div>Required: {activeChallenge.requiredNodeTypes.join(', ')}</div>
            )}
            {activeChallenge.forbiddenNodeTypes?.length > 0 && (
              <div>Forbidden: {activeChallenge.forbiddenNodeTypes.join(', ')}</div>
            )}
          </div>

          {activeChallenge.hints?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button className="toolbar-btn" onClick={() => setShowHints((h) => !h)}>
                {showHints ? 'HIDE HINTS' : 'SHOW HINTS'}
              </button>
              {showHints && (
                <ul className="hint-list">
                  {activeChallenge.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="challenge-actions">
            <button className="toolbar-btn" onClick={handleSubmit}>SUBMIT</button>
            <button className="toolbar-btn" onClick={exitChallenge}>EXIT</button>
          </div>

          {challengeResults && (
            <div className="challenge-results">
              {challengeResults.structErrors?.length > 0 && (
                <div className="struct-errors">
                  <div className="result-label">STRUCTURE ERRORS:</div>
                  {challengeResults.structErrors.map((e, i) => (
                    <div key={i} className="test-result-item fail">- {e}</div>
                  ))}
                </div>
              )}
              {challengeResults.testResults?.length > 0 && (
                <>
                  <div className="result-label">
                    TEST RESULTS: {challengeResults.passed ? 'ALL PASSED' : 'FAILED'}
                  </div>
                  {challengeResults.testResults.map((r, i) => (
                    <div key={i} className={`test-result-item ${r.passed ? 'pass' : 'fail'}`}>
                      #{i + 1}: expected {JSON.stringify(r.expected)}, got {JSON.stringify(r.output)} — {r.passed ? 'PASS' : 'FAIL'}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-panel">
      <div className="panel-header">CHALLENGES</div>
      <div className="challenge-list">
        {CHALLENGES.map((ch) => (
          <div key={ch.id} className="challenge-item">
            <div className="challenge-item-header">
              <span className="challenge-title">{ch.title}</span>
              <span className={`difficulty-badge ${ch.difficulty}`}>
                {ch.difficulty.toUpperCase()}
              </span>
            </div>
            <p className="challenge-desc">{ch.description}</p>
            <button className="toolbar-btn" onClick={() => startChallenge(ch)}>
              START
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
