"use strict";

import { Group, RoundedRect, Text } from '@shopify/react-native-skia';
import { font } from "./common.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ToolTip({
  data,
  style
}) {
  const padding = style?.padding ?? 5;
  if (!data) return null;
  const {
    width: textWidth,
    height: textHeight
  } = font.measureText(data.label);
  const width = textWidth + padding * 2;
  const height = textHeight + padding * 2;
  const {
    centerX,
    centerY,
    label
  } = data;
  let tooltipX = centerX - width / 2;
  let tooltipY = centerY - height / 2;
  tooltipX = Math.max(0, tooltipX);
  tooltipY = Math.max(0, tooltipY);
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
      y: tooltipY + height - padding,
      text: label,
      color: "white",
      font: font
    })]
  });
}
//# sourceMappingURL=Tooltip.js.map