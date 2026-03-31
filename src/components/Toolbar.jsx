import { useState, useEffect, useCallback } from "react";
import { useFlowStore } from "../store/flowStore";
import { executeGraph } from "../utils/nodeExecutor";
import JsonImportExportModal from "./modals/JsonImportExportModal";

export default function Toolbar({ leftPanel, setLeftPanel, rightPanel, setRightPanel }) {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const isRunning = useFlowStore((s) => s.isRunning);
  const debugMode = useFlowStore((s) => s.debugMode);
  const setExecutionResults = useFlowStore((s) => s.setExecutionResults);
  const setDebugMode = useFlowStore((s) => s.setDebugMode);
  const setDebugStep = useFlowStore((s) => s.setDebugStep);
  const setDebugSteps = useFlowStore((s) => s.setDebugSteps);
  const setIsRunning = useFlowStore((s) => s.setIsRunning);
  const setConsoleLogs = useFlowStore((s) => s.setConsoleLogs);
  const clearResults = useFlowStore((s) => s.clearResults);
  const exportToJson = useFlowStore((s) => s.exportToJson);

  const [showJson, setShowJson] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vp-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vp-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toggleLeft = useCallback((panel) => setLeftPanel((p) => (p === panel ? null : panel)), [setLeftPanel]);
  const toggleRight = useCallback((panel) => setRightPanel((p) => (p === panel ? null : panel)), [setRightPanel]);

  const handleRun = useCallback(() => {
    if (isRunning || nodes.length === 0) return;
    setIsRunning(true);
    setDebugMode(false);
    executeGraph(nodes, edges)
      .then((r) => {
        setExecutionResults(r.results);
        setConsoleLogs(r.logs || []);
      })
      .catch(() => {})
      .finally(() => {
        setIsRunning(false);
      });
  }, [nodes, edges, isRunning, setIsRunning, setDebugMode, setExecutionResults]);

  const handleDebug = useCallback(() => {
    if (nodes.length === 0) return;
    executeGraph(nodes, edges).then(({ results, steps, logs }) => {
      setExecutionResults(results);
      setConsoleLogs(logs || []);
      setDebugSteps(steps);
      setDebugStep(0);
      setDebugMode(true);
    });
  }, [nodes, edges, setExecutionResults, setDebugSteps, setDebugStep, setDebugMode, setRightPanel]);

  const handleStopDebug = useCallback(() => {
    setDebugMode(false);
    setDebugSteps([]);
    setDebugStep(0);
  }, [setDebugMode, setDebugSteps, setDebugStep]);

  const handleClear = useCallback(() => {
    clearResults();
    setDebugMode(false);
  }, [clearResults, setDebugMode]);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      switch (e.key.toLowerCase()) {
        case "n":
          toggleLeft("palette");
          break;
        case "m":
          toggleLeft("modules");
          break;
        case "p":
          toggleRight("properties");
          break;
        case "e":
          toggleLeft("examples");
          break;
        case "c":
          toggleLeft("challenges");
          break;
        case "s":
          toggleLeft("solutions");
          break;
        case "r":
          handleRun();
          break;
        case "d":
          debugMode ? handleStopDebug() : handleDebug();
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleLeft, toggleRight, handleRun, handleDebug, handleStopDebug, debugMode]);

  const handleShareUrl = useCallback(() => {
    const json = exportToJson();
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("flow", encoded);
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setShareMsg("URL copied!");
        setTimeout(() => setShareMsg(""), 2000);
      })
      .catch(() => {
        setShareMsg("Copy failed");
        setTimeout(() => setShareMsg(""), 2000);
      });
  }, [exportToJson]);

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-brand">
          <span className="brand-icon">&#9670;</span>
          <span className="brand-name">Visual Programmer</span>
        </div>

        <div className="toolbar-actions">
          <button
            className={`toolbar-btn ${leftPanel === "palette" ? "active" : ""}`}
            onClick={() => toggleLeft("palette")}
            title="Node Palette (N)"
          >
            Nodes
          </button>
          <button
            className={`toolbar-btn ${leftPanel === "modules" ? "active" : ""}`}
            onClick={() => toggleLeft("modules")}
            title="Modules (M)"
          >
            Modules
          </button>
          <button
            className={`toolbar-btn ${rightPanel === "properties" ? "active" : ""}`}
            onClick={() => toggleRight("properties")}
            title="Properties (P)"
          >
            Props
          </button>

          <div className="toolbar-separator" />

          <button
            className={`toolbar-btn ${leftPanel === "examples" ? "active" : ""}`}
            onClick={() => toggleLeft("examples")}
            title="Examples (E)"
          >
            Examples
          </button>
          <button
            className={`toolbar-btn ${leftPanel === "challenges" ? "active" : ""}`}
            onClick={() => toggleLeft("challenges")}
            title="Challenges (C)"
          >
            Challenge
          </button>
          <button
            className={`toolbar-btn ${leftPanel === "solutions" ? "active" : ""}`}
            onClick={() => toggleLeft("solutions")}
            title="Saved Solutions (S)"
          >
            Solutions
          </button>

          <div className="toolbar-separator" />

          <button
            className="toolbar-btn run-btn"
            onClick={handleRun}
            disabled={isRunning || nodes.length === 0}
            title="Run flow (R)"
          >
            Run
          </button>

          {debugMode ? (
            <button className="toolbar-btn debug-stop-btn" onClick={handleStopDebug} title="Stop debugging (D)">
              Stop
            </button>
          ) : (
            <button
              className="toolbar-btn debug-btn"
              onClick={handleDebug}
              disabled={nodes.length === 0}
              title="Run in debug mode (D)"
            >
              Debug
            </button>
          )}

          <button className="toolbar-btn" onClick={handleClear} title="Clear results">
            CLR
          </button>

          <div className="toolbar-separator" />

          <button className="toolbar-btn json-btn" onClick={() => setShowJson(true)} title="Import/Export JSON">
            JSON
          </button>
          <button className="toolbar-btn share-btn" onClick={handleShareUrl} title="Copy shareable URL to clipboard">
            {shareMsg || "Share"}
          </button>

          <div className="toolbar-separator" />
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>

        <div className="toolbar-status">
          {isRunning && <span className="status-running">RUNNING...</span>}
          {debugMode && <span className="status-debug">DBG MODE</span>}
          <span className="status-info">
            {nodes.length}N {edges.length}E
          </span>
        </div>
      </div>

      {showJson && <JsonImportExportModal onClose={() => setShowJson(false)} />}
    </>
  );
}
