export function setOpacity(colorValue, alpha) {
  if (!colorValue) return null;
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");

  // Resolve CSS var(...) to its value (assumed to be a hex like #rrggbb)
  if (colorValue.startsWith("var(")) {
    try {
      const varName = colorValue.slice(4, -1).trim();
      if (typeof window !== "undefined" && window.getComputedStyle) {
        const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (resolved && resolved.startsWith("#")) return `${resolved}${alphaHex}`;
        return resolved || colorValue;
      }
    } catch (e) {
      return colorValue;
    }
  }

  // If it's already a hex, append alpha as two hex digits
  if (colorValue.startsWith("#")) return `${colorValue}${alphaHex}`;

  return colorValue;
}

export default setOpacity;
