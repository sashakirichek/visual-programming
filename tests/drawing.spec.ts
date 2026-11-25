import { test, expect, type Page } from "@playwright/test";

async function drag(page: Page, startX: number, startY: number, endX: number, endY: number) {
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 6 });
  await page.mouse.up();
}

async function storedDrawings(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("vp-flow-state") || "{}").drawings || []);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("toolbar", { name: "Canvas tools" })).toBeVisible();
});

test("rectangles can be selected, resized, and restored after reload", async ({ page }) => {
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  expect(canvas).not.toBeNull();
  const startX = canvas!.x + canvas!.width * 0.42;
  const startY = canvas!.y + canvas!.height * 0.36;

  await page.getByRole("button", { name: "Rectangle" }).click();
  await drag(page, startX, startY, startX + 110, startY + 72);
  await expect(page.locator(".drawing-shape-visible")).toHaveCount(1);
  expect((await storedDrawings(page))[0]).not.toHaveProperty("text");

  await expect(page.getByRole("button", { name: "Select and move" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".drawing-selection-box")).toBeVisible();
  await page.mouse.click(startX + 45, startY + 30);
  await expect(page.locator(".drawing-selection-box")).toBeVisible();
  await page.locator(".drawing-shape-visible").dblclick();
  const shapeEditor = page.getByRole("textbox", { name: "Shape text" });
  await expect(shapeEditor).toBeVisible();
  await expect(shapeEditor).toHaveValue("");
  await shapeEditor.fill("Centered rectangle label");
  await expect.poll(async () => (await storedDrawings(page))[0]?.text).toBe("Centered rectangle label");
  await page.getByRole("button", { name: "Select and move" }).click();
  const initial = (await storedDrawings(page))[0];
  await drag(page, startX + 45, startY + 30, startX + 65, startY + 48);
  await expect.poll(async () => (await storedDrawings(page))[0]?.x).toBeGreaterThan(initial.x);
  const previous = (await storedDrawings(page))[0];
  const resizeHandle = await page.locator(".drawing-resize-handle").boundingBox();
  expect(resizeHandle).not.toBeNull();
  await drag(page, resizeHandle!.x + 5, resizeHandle!.y + 5, resizeHandle!.x + 30, resizeHandle!.y + 24);

  await expect.poll(async () => (await storedDrawings(page))[0]?.width).toBeGreaterThan(previous.width);
  await page.reload();
  await expect(page.locator(".drawing-shape-visible")).toHaveCount(1);
  expect((await storedDrawings(page))[0].type).toBe("rectangle");
  await page.keyboard.press("Delete");
  await expect.poll(async () => (await storedDrawings(page)).length).toBe(0);
});

test("arrows snap to workflow-node anchors", async ({ page }) => {
  const node = {
    id: "snap-target",
    type: "inputNode",
    position: { x: 220, y: 180 },
    data: { label: "inputNode", value: "", valueType: "literal" },
  };
  await page.evaluate((flowNode) => {
    localStorage.setItem("vp-flow-state", JSON.stringify({ nodes: [flowNode], edges: [], modules: {} }));
  }, node);
  await page.reload();
  const nodeBounds = await page.locator(".react-flow__node").first().boundingBox();
  expect(nodeBounds).not.toBeNull();

  await page.getByRole("button", { name: "Snapped arrow" }).click();
  await drag(page, nodeBounds!.x + nodeBounds!.width + 130, nodeBounds!.y + nodeBounds!.height / 2, nodeBounds!.x + nodeBounds!.width, nodeBounds!.y + nodeBounds!.height / 2);

  await expect.poll(async () => (await storedDrawings(page)).length).toBe(1);
  const arrow = (await storedDrawings(page))[0];
  expect(arrow.type).toBe("arrow");
  expect(arrow.end.targetType).toBe("node");
  expect(arrow.end.targetId).toBe("snap-target");
});

test("snapped lines attach to rectangle midpoint anchors", async ({ page }) => {
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  expect(canvas).not.toBeNull();
  const left = canvas!.x + canvas!.width * 0.45;
  const top = canvas!.y + canvas!.height * 0.35;

  await page.getByRole("button", { name: "Rectangle" }).click();
  await drag(page, left, top, left + 120, top + 90);
  const rectangle = (await storedDrawings(page))[0];
  const bounds = await page.locator(".drawing-shape-visible").boundingBox();
  expect(bounds).not.toBeNull();

  await page.getByRole("button", { name: "Snapped line" }).click();
  await drag(page, bounds!.x - 90, bounds!.y + bounds!.height / 2, bounds!.x, bounds!.y + bounds!.height / 2);

  await expect.poll(async () => (await storedDrawings(page)).length).toBe(2);
  const line = (await storedDrawings(page)).find((drawing: { type: string }) => drawing.type === "line");
  expect(line.start.targetType).toBe("drawing");
  expect(line.start.targetId).toBe(rectangle.id);
  expect(line.start.anchor).toBe("left");
});

test("freehand vector data survives JSON round-trip and legacy imports", async ({ page }) => {
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  expect(canvas).not.toBeNull();
  const startX = canvas!.x + canvas!.width * 0.55;
  const startY = canvas!.y + canvas!.height * 0.55;

  await page.getByRole("button", { name: "Freehand" }).click();
  await expect(page.locator(".drawing-snap-anchor")).toHaveCount(0);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 35, startY + 22);
  await page.mouse.move(startX + 75, startY - 5);
  await page.mouse.up();
  await expect.poll(async () => (await storedDrawings(page))[0]?.points?.length).toBeGreaterThan(1);
  const stroke = (await storedDrawings(page))[0];
  expect(stroke.points.some((point: { x: number; y: number }) => point.x % 8 !== 0 || point.y % 8 !== 0)).toBe(true);
  await expect(page.getByRole("button", { name: "Select and move" })).toHaveAttribute("aria-pressed", "true");

  await page.getByTitle("Import/Export JSON").click();
  const exportArea = page.locator(".json-textarea");
  const exported = JSON.parse(await exportArea.inputValue());
  expect(exported.drawings[0].type).toBe("freehand");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await page.locator(".json-textarea").fill(JSON.stringify(exported));
  await page.locator(".modal-actions .btn-primary").click();
  await expect(page.getByText("Import successful!")).toBeVisible();
  await expect.poll(async () => (await storedDrawings(page)).length).toBe(1);

  await page.getByTitle("Import/Export JSON").click();
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await page.locator(".json-textarea").fill(JSON.stringify({ nodes: [], edges: [], modules: {} }));
  await page.locator(".modal-actions .btn-primary").click();
  await expect(page.getByText("Import successful!")).toBeVisible();
  await expect.poll(async () => (await storedDrawings(page)).length).toBe(0);
});

test("text is selected and editable immediately after creation", async ({ page }) => {
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  expect(canvas).not.toBeNull();
  await page.getByRole("button", { name: "Text" }).click();
  await page.mouse.click(canvas!.x + canvas!.width * 0.52, canvas!.y + canvas!.height * 0.42);

  const editor = page.getByRole("textbox", { name: "Drawing text" });
  await expect(editor).toBeVisible();
  await expect(page.getByRole("button", { name: "Select and move" })).toHaveAttribute("aria-pressed", "true");
  await editor.fill("Editable mind map text");
  await expect.poll(async () => (await storedDrawings(page))[0]?.text).toBe("Editable mind map text");
  await expect(page.locator(".drawing-resize-handle")).toBeVisible();
});

test("ellipses get an empty centered text field only after double-click", async ({ page }) => {
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  expect(canvas).not.toBeNull();
  const x = canvas!.x + canvas!.width * 0.46;
  const y = canvas!.y + canvas!.height * 0.38;
  await page.getByRole("button", { name: "Ellipse" }).click();
  await drag(page, x, y, x + 110, y + 90);

  const ellipse = page.locator(".drawing-shape-visible");
  expect((await storedDrawings(page))[0]).not.toHaveProperty("text");
  await expect(page.getByRole("textbox", { name: "Shape text" })).toHaveCount(0);
  await ellipse.dblclick();
  const editor = page.getByRole("textbox", { name: "Shape text" });
  await expect(editor).toBeVisible();
  await expect(editor).toHaveValue("");
  await editor.fill("Oval label");
  await expect.poll(async () => (await storedDrawings(page))[0]?.text).toBe("Oval label");
});