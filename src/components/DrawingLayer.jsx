import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, useReactFlow, useViewport } from "@xyflow/react";
import { useFlowStore } from "../store/flowStore";

const SNAP_DISTANCE = 18;

function makeDrawingId() {
  return `drawing_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

function getAnchor(point, width, height, anchor) {
  switch (anchor) {
    case "top":
      return { x: point.x + width / 2, y: point.y };
    case "right":
      return { x: point.x + width, y: point.y + height / 2 };
    case "bottom":
      return { x: point.x + width / 2, y: point.y + height };
    default:
      return { x: point.x, y: point.y + height / 2 };
  }
}

function getDrawingBounds(drawing) {
  if (["rectangle", "ellipse", "text"].includes(drawing.type)) {
    return { x: drawing.x, y: drawing.y, width: drawing.width, height: drawing.height };
  }
  return null;
}

function translateDrawing(drawing, delta) {
  if (["rectangle", "ellipse", "text"].includes(drawing.type)) {
    return { ...drawing, x: drawing.x + delta.x, y: drawing.y + delta.y };
  }
  if (drawing.type === "freehand") {
    return { ...drawing, points: drawing.points.map((point) => ({ x: point.x + delta.x, y: point.y + delta.y })) };
  }
  if (["line", "arrow"].includes(drawing.type)) {
    return {
      ...drawing,
      start: { ...drawing.start, x: drawing.start.x + delta.x, y: drawing.start.y + delta.y },
      end: { ...drawing.end, x: drawing.end.x + delta.x, y: drawing.end.y + delta.y },
    };
  }
  return drawing;
}

export default function DrawingLayer({ mode, onModeChange }) {
  const { flowToScreenPosition, screenToFlowPosition } = useReactFlow();
  const viewport = useViewport();
  const drawings = useFlowStore((state) => state.drawings);
  const nodes = useFlowStore((state) => state.nodes);
  const theme = useFlowStore((state) => state.theme);
  const addDrawing = useFlowStore((state) => state.addDrawing);
  const updateDrawing = useFlowStore((state) => state.updateDrawing);
  const removeDrawing = useFlowStore((state) => state.removeDrawing);
  const [selectedId, setSelectedId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const rootRef = useRef(null);
  const gestureRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const bounds = entry.target.getBoundingClientRect();
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height, left: bounds.left, top: bounds.top });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const toScreen = useCallback(
    (point) => {
      const screen = flowToScreenPosition(point);
      return { x: screen.x - size.left, y: screen.y - size.top };
    },
    [flowToScreenPosition, size],
  );

  const toFlow = useCallback(
    (event) => screenToFlowPosition({ x: event.clientX, y: event.clientY }, { snapToGrid: false }),
    [screenToFlowPosition],
  );

  const anchorTargets = useCallback(() => {
    const targets = [];
    for (const drawing of drawings) {
      const bounds = getDrawingBounds(drawing);
      if (!bounds) continue;
      for (const anchor of ["top", "right", "bottom", "left"]) {
        targets.push({
          x: getAnchor(bounds, bounds.width, bounds.height, anchor).x,
          y: getAnchor(bounds, bounds.width, bounds.height, anchor).y,
          targetType: "drawing",
          targetId: drawing.id,
          anchor,
        });
      }
    }
    for (const node of nodes) {
      const width = node.measured?.width || node.width || 180;
      const height = node.measured?.height || node.height || 80;
      const bounds = { x: node.position.x, y: node.position.y, width, height };
      for (const anchor of ["top", "right", "bottom", "left"]) {
        const point = getAnchor(bounds, width, height, anchor);
        targets.push({ ...point, targetType: "node", targetId: node.id, anchor });
      }
    }
    return targets;
  }, [drawings, nodes]);

  const findSnap = useCallback(
    (point) => {
      let nearest = null;
      let nearestDistance = SNAP_DISTANCE;
      const pointer = toScreen(point);
      for (const target of anchorTargets()) {
        const screen = toScreen(target);
        const distance = Math.hypot(screen.x - pointer.x, screen.y - pointer.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = target;
        }
      }
      return nearest || point;
    },
    [anchorTargets, toScreen],
  );

  const resolveEndpoint = useCallback(
    (endpoint) => {
      if (endpoint.targetType === "drawing") {
        const target = drawings.find((drawing) => drawing.id === endpoint.targetId);
        const bounds = target && getDrawingBounds(target);
        if (bounds) return getAnchor(bounds, bounds.width, bounds.height, endpoint.anchor);
      }
      if (endpoint.targetType === "node") {
        const target = nodes.find((node) => node.id === endpoint.targetId);
        if (target) {
          const width = target.measured?.width || target.width || 180;
          const height = target.measured?.height || target.height || 80;
          return getAnchor({ x: target.position.x, y: target.position.y }, width, height, endpoint.anchor);
        }
      }
      return endpoint;
    },
    [drawings, nodes],
  );

  const beginGesture = (event) => {
    if (event.button !== 0) return;
    const point = toFlow(event);
    const svg = event.currentTarget;
    svg.setPointerCapture(event.pointerId);

    if (mode === "select") {
      setEditingTextId(null);
      const resizeTarget = event.target.closest?.("[data-resize-id]");
      const moveTarget = event.target.closest?.("[data-move-id]");
      const shapeTarget = event.target.closest?.("[data-drawing-id]");
      const id =
        resizeTarget?.getAttribute("data-resize-id") ||
        moveTarget?.getAttribute("data-move-id") ||
        shapeTarget?.getAttribute("data-drawing-id");
      const original = drawings.find((drawing) => drawing.id === id);
      setSelectedId(id || null);
      if (original) {
        gestureRef.current = {
          action: resizeTarget ? "resize" : "move",
          pointerId: event.pointerId,
          start: point,
          original,
        };
        setDraft(original);
      }
      return;
    }

    if (mode === "pan") return;
    const type = mode === "freeLine" ? "line" : mode;
    const drawing = {
      id: makeDrawingId(),
      type,
      stroke: theme === "dark" ? "#e5e7eb" : "#202124",
      fill: "none",
      strokeWidth: 2,
    };
    if (["rectangle", "ellipse", "text"].includes(type)) Object.assign(drawing, { x: point.x, y: point.y, width: 0, height: 0 });
    if (type === "text") Object.assign(drawing, { width: 180, height: 56, text: "Text" });
    if (type === "freehand") drawing.points = [point];
    if (["line", "arrow"].includes(type)) Object.assign(drawing, { start: point, end: point, freeLine: mode === "freeLine" });
    gestureRef.current = { action: "create", pointerId: event.pointerId, start: point, original: drawing };
    setDraft(drawing);
  };

  const moveGesture = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const point = toFlow(event);
    if (gesture.action === "create") {
      const { original, start } = gesture;
      if (original.type === "rectangle" || original.type === "ellipse") {
        const x = Math.min(start.x, point.x);
        const y = Math.min(start.y, point.y);
        setDraft({ ...original, x, y, width: Math.abs(point.x - start.x), height: Math.abs(point.y - start.y) });
      } else if (original.type === "freehand") {
        setDraft((current) => ({ ...current, points: [...(current?.points || original.points), point] }));
      } else if (original.type === "line" || original.type === "arrow") {
        setDraft({ ...original, end: original.freeLine ? point : findSnap(point) });
      }
      return;
    }

    const { original, start } = gesture;
    if (gesture.action === "resize") {
      setDraft({ ...original, width: Math.max(20, original.width + point.x - start.x), height: Math.max(20, original.height + point.y - start.y) });
    } else {
      setDraft(translateDrawing(original, { x: point.x - start.x, y: point.y - start.y }));
    }
  };

  const finishGesture = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const point = toFlow(event);
    if (gesture.action === "create") {
      let drawing = draft || gesture.original;
      if (drawing.type === "rectangle" || drawing.type === "ellipse") {
        if (drawing.width * viewport.zoom < 8 && drawing.height * viewport.zoom < 8) {
          drawing = { ...drawing, width: drawing.type === "ellipse" ? 90 : 120, height: drawing.type === "ellipse" ? 90 : 80 };
        }
      }
      if (drawing.type === "text") drawing = { ...drawing, x: gesture.start.x, y: gesture.start.y };
      if ((drawing.type === "line" || drawing.type === "arrow") && !drawing.freeLine) {
        drawing = { ...drawing, start: findSnap(gesture.start), end: findSnap(point) };
      }
      if (drawing.type !== "freehand" || drawing.points.length > 1) {
        addDrawing(drawing);
        setSelectedId(drawing.id);
        onModeChange("select");
      }
    } else if (draft) {
      updateDrawing(gesture.original.id, draft);
    }
    gestureRef.current = null;
    setDraft(null);
  };

  const activateShapeText = (drawing) => {
    setSelectedId(drawing.id);
    setEditingTextId(drawing.id);
    if (typeof drawing.text !== "string") updateDrawing(drawing.id, { text: "" });
  };

  useEffect(() => {
    if (!selectedId) return undefined;
    const handleKeyDown = (event) => {
      if ((event.key === "Delete" || event.key === "Backspace") && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        removeDrawing(selectedId);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [removeDrawing, selectedId]);

  const visibleDrawings = drawings.map((drawing) => (draft?.id === drawing.id ? draft : drawing));
  if (draft && !drawings.some((drawing) => drawing.id === draft.id)) visibleDrawings.push(draft);
  const showSnapTargets = mode === "arrow" || mode === "line";

  return (
    <Panel position="top-left" className="drawing-layer-panel">
      <div ref={rootRef} className={`drawing-layer ${mode === "select" ? "is-selecting" : ""}`}>
        <svg
          className="drawing-layer-svg"
          width={size.width}
          height={size.height}
          onPointerDown={beginGesture}
          onPointerMove={moveGesture}
          onPointerUp={finishGesture}
          onPointerCancel={finishGesture}
          style={{ pointerEvents: mode === "select" || mode === "pan" ? "none" : "auto" }}
          aria-label="Drawing canvas"
        >
          <defs>
            <marker id="drawing-arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L10,4 L0,8 z" fill="context-stroke" />
            </marker>
          </defs>
          {mode !== "select" && mode !== "pan" && <rect className="drawing-capture-surface" width={size.width} height={size.height} />}
          {visibleDrawings.map((drawing) => {
            const selected = drawing.id === selectedId;
            if (drawing.type === "rectangle" || drawing.type === "ellipse") {
              const start = toScreen({ x: drawing.x, y: drawing.y });
              const end = toScreen({ x: drawing.x + drawing.width, y: drawing.y + drawing.height });
              const shapeProps = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y),
                fill: drawing.fill,
                stroke: drawing.stroke,
                strokeWidth: drawing.strokeWidth * viewport.zoom,
              };
              const Shape = drawing.type === "rectangle" ? "rect" : "ellipse";
              const hasText = typeof drawing.text === "string";
              return (
                <g
                  key={drawing.id}
                  data-drawing-id={drawing.id}
                  onDoubleClick={() => activateShapeText(drawing)}
                >
                  <Shape {...shapeProps} className="drawing-shape-visible" pointerEvents={mode === "select" ? "visiblePainted" : "none"} />
                  {mode === "select" && <Shape {...shapeProps} fill="transparent" stroke="transparent" strokeWidth={14} pointerEvents="all" className="drawing-hit-area" />}
                  {(hasText || editingTextId === drawing.id) && (
                    <foreignObject
                      x={shapeProps.x + 8}
                      y={shapeProps.y + 8}
                      width={Math.max(1, shapeProps.width - 16)}
                      height={Math.max(1, shapeProps.height - 16)}
                      pointerEvents={editingTextId === drawing.id ? "all" : "none"}
                    >
                      <div xmlns="http://www.w3.org/1999/xhtml" className="drawing-shape-text-wrap">
                        {editingTextId === drawing.id ? (
                          <textarea
                            className="drawing-shape-text-editor"
                            aria-label="Shape text"
                            value={drawing.text ?? ""}
                            autoFocus
                            onPointerDown={(event) => event.stopPropagation()}
                            onChange={(event) => updateDrawing(drawing.id, { text: event.target.value })}
                            onBlur={() => setEditingTextId(null)}
                          />
                        ) : (
                          <div className="drawing-shape-text">{drawing.text}</div>
                        )}
                      </div>
                    </foreignObject>
                  )}
                  {selected && (
                    <>
                      <rect className="drawing-selection-box" x={shapeProps.x - 3} y={shapeProps.y - 3} width={shapeProps.width + 6} height={shapeProps.height + 6} />
                      <rect data-resize-id={drawing.id} className="drawing-resize-handle" x={end.x - 5} y={end.y - 5} width="10" height="10" pointerEvents="all" />
                    </>
                  )}
                </g>
              );
            }
            if (drawing.type === "text") {
              const start = toScreen({ x: drawing.x, y: drawing.y });
              const end = toScreen({ x: drawing.x + drawing.width, y: drawing.y + drawing.height });
              return (
                <g key={drawing.id} data-drawing-id={drawing.id}>
                  <foreignObject x={start.x} y={start.y} width={Math.max(1, end.x - start.x)} height={Math.max(1, end.y - start.y)} pointerEvents={mode === "select" ? "all" : "none"}>
                    {selected ? (
                      <textarea
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="drawing-text-editor"
                        aria-label="Drawing text"
                        value={drawing.text}
                        autoFocus
                        onPointerDown={(event) => event.stopPropagation()}
                        onChange={(event) => updateDrawing(drawing.id, { text: event.target.value })}
                      />
                    ) : (
                      <div xmlns="http://www.w3.org/1999/xhtml" className="drawing-text-content">{drawing.text}</div>
                    )}
                  </foreignObject>
                  {selected && (
                    <>
                      <rect className="drawing-selection-box" x={start.x - 3} y={start.y - 3} width={end.x - start.x + 6} height={end.y - start.y + 6} />
                      <rect data-move-id={drawing.id} className="drawing-move-handle" x={start.x - 1} y={start.y - 1} width="14" height="14" pointerEvents="all" />
                      <rect data-resize-id={drawing.id} className="drawing-resize-handle" x={end.x - 5} y={end.y - 5} width="10" height="10" pointerEvents="all" />
                    </>
                  )}
                </g>
              );
            }
            if (drawing.type === "freehand") {
              const points = drawing.points.map(toScreen);
              const path = points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
              return (
                <g key={drawing.id} data-drawing-id={drawing.id}>
                  <path d={path} fill="none" stroke={drawing.stroke} strokeWidth={drawing.strokeWidth * viewport.zoom} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
                  {mode === "select" && <path d={path} fill="none" stroke="transparent" strokeWidth="16" pointerEvents="stroke" className="drawing-hit-area" />}
                </g>
              );
            }
            if (drawing.type === "line" || drawing.type === "arrow") {
              const start = toScreen(resolveEndpoint(drawing.start));
              const end = toScreen(resolveEndpoint(drawing.end));
              return (
                <g key={drawing.id} data-drawing-id={drawing.id}>
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={drawing.stroke} strokeWidth={drawing.strokeWidth * viewport.zoom} markerEnd={drawing.type === "arrow" ? "url(#drawing-arrowhead)" : undefined} pointerEvents="none" />
                  {mode === "select" && <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth="16" pointerEvents="stroke" className="drawing-hit-area" />}
                </g>
              );
            }
            return null;
          })}
          {showSnapTargets && anchorTargets().map((target) => {
            const screen = toScreen(target);
            return <circle key={`${target.targetType}-${target.targetId}-${target.anchor}`} className="drawing-snap-anchor" cx={screen.x} cy={screen.y} r="5" pointerEvents="none" />;
          })}
        </svg>
      </div>
    </Panel>
  );
}