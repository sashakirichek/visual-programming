import { useState, useEffect, useCallback } from "react";
import { useFlowStore } from "../store/flowStore";
import { executeGraph } from "../utils/nodeExecutor";
import JsonImportExportModal from "./modals/JsonImportExportModal";
import QrCodeModal from "./modals/QrCodeModal";

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
  const clearFlow = useFlowStore((s) => s.clearFlow);
  const exportToJson = useFlowStore((s) => s.exportToJson);

  const [showJson, setShowJson] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
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

  const handleClearAll = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;

    const confirmed = window.confirm("Remove all nodes and edges? Saved modules will be kept.");
    if (!confirmed) return;

    clearFlow();
    setRightPanel(null);
  }, [nodes.length, edges.length, clearFlow, setRightPanel]);

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

  const buildShareUrl = useCallback(() => {
    const json = exportToJson();
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("flow", encoded);
    return url.toString();
  }, [exportToJson]);

  const handleShareUrl = useCallback(() => {
    const url = buildShareUrl();
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareMsg("URL copied!");
        setTimeout(() => setShareMsg(""), 5000);
      })
      .catch(() => {
        setShareMsg("Copy failed");
        setTimeout(() => setShareMsg(""), 5000);
      });
  }, [buildShareUrl]);

  const handleShowQr = useCallback(() => {
    setQrUrl(buildShareUrl());
    setShowQr(true);
  }, [buildShareUrl]);

  const closeMenuOnClick = (action) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#f5ad42"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
              stroke="#f87204"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M12 12L12 22" stroke="#f87204" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 2L18 12" stroke="#f87204" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        {/* Hamburger menu button - mobile only */}
        <button
          className="hamburger-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Toggle menu"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop toolbar actions */}
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
            <button className="toolbar-btn" onClick={handleStopDebug} title="Stop debugging (D)">
              Stop
            </button>
          ) : (
            <button
              className={`toolbar-btn ${nodes.length === 0 ? "opacity-50" : ""}`}
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
          <button
            className="toolbar-btn"
            onClick={handleClearAll}
            disabled={nodes.length === 0 && edges.length === 0}
            title="Remove all nodes and edges"
          >
            Clear All
          </button>

          <div className="toolbar-separator" />

          <button className="toolbar-btn" onClick={() => setShowJson(true)} title="Import/Export JSON">
            JSON
          </button>
          <button
            className="toolbar-btn"
            data-testid="shareUrl"
            onClick={handleShareUrl}
            title="Copy shareable URL to clipboard"
          >
            {shareMsg || "Share"}
          </button>
          <button className="toolbar-btn" onClick={handleShowQr} title="Show QR code for this flow">
            QR
          </button>

          <div className="toolbar-separator" />
          <button
            className="toolbar-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
        {/* 
        <div className="toolbar-status">
          {isRunning && <span className="status-running">RUNNING...</span>}
          {debugMode && <span className="status-debug">DBG MODE</span>}
          <span className="status-info">
            {nodes.length}N {edges.length}E
          </span>
        </div> */}

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <button
              onClick={() => closeMenuOnClick(() => toggleLeft("palette"))}
              className={leftPanel === "palette" ? "active" : ""}
            >
              Nodes
            </button>
            <button
              onClick={() => closeMenuOnClick(() => toggleLeft("modules"))}
              className={leftPanel === "modules" ? "active" : ""}
            >
              Modules
            </button>
            <button
              onClick={() => closeMenuOnClick(() => toggleRight("properties"))}
              className={rightPanel === "properties" ? "active" : ""}
            >
              Props
            </button>
            <div className="mobile-menu-separator"></div>
            <button
              onClick={() => closeMenuOnClick(() => toggleLeft("examples"))}
              className={leftPanel === "examples" ? "active" : ""}
            >
              Examples
            </button>
            <button
              onClick={() => closeMenuOnClick(() => toggleLeft("challenges"))}
              className={leftPanel === "challenges" ? "active" : ""}
            >
              Challenge
            </button>
            <button
              onClick={() => closeMenuOnClick(() => toggleLeft("solutions"))}
              className={leftPanel === "solutions" ? "active" : ""}
            >
              Solutions
            </button>
            <div className="mobile-menu-separator"></div>
            <button onClick={() => closeMenuOnClick(handleRun)} disabled={isRunning || nodes.length === 0}>
              Run
            </button>
            <button
              onClick={() => closeMenuOnClick(debugMode ? handleStopDebug : handleDebug)}
              disabled={!debugMode && nodes.length === 0}
            >
              {debugMode ? "Stop" : "Debug"}
            </button>
            <button onClick={() => closeMenuOnClick(handleClear)}>CLR</button>
            <button
              onClick={() => closeMenuOnClick(handleClearAll)}
              disabled={nodes.length === 0 && edges.length === 0}
            >
              Clear All
            </button>
            <div className="mobile-menu-separator"></div>
            <button onClick={() => closeMenuOnClick(() => setShowJson(true))}>JSON</button>
            <button onClick={() => closeMenuOnClick(handleShareUrl)}>{shareMsg || "Share"}</button>
            <button onClick={() => closeMenuOnClick(handleShowQr)}>QR</button>
            <div className="mobile-menu-separator"></div>
            <button onClick={() => closeMenuOnClick(toggleTheme)}>
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        )}
      </div>

      {showJson && <JsonImportExportModal onClose={() => setShowJson(false)} />}
      {showQr && <QrCodeModal url={qrUrl} onClose={() => setShowQr(false)} />}
    </>
  );
}
