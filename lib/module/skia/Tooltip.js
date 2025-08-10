"use strict";

import { Group, RoundedRect, Text } from "@shopify/react-native-skia";
import { font } from "./common.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ToolTip({
  data
}) {
  const padding = 5;
  if (!data) return null;
  const {
    width: textWidth,
    height: textHeight
  } = font.measureText(data.label);
  const width = textWidth + padding * 2;
  const height = textHeight + padding * 2;
  const {
    x,
    y,
    label
  } = data;
  const tooltipX = x;
  const tooltipY = y + height;
  return /*#__PURE__*/_jsxs(Group, {
    children: [/*#__PURE__*/_jsx(RoundedRect, {
      x: tooltipX,
      y: tooltipY,
      width: width,
      height: height,
      r: 8,
      color: "gray",
      opacity: 0.85
    }), /*#__PURE__*/_jsx(Text, {
      x: tooltipX + padding,
      y: tooltipY + height / 2 + padding,
      text: label,
      color: "white",
      font: font
    })]
  });
}
//# sourceMappingURL=Tooltip.js.map