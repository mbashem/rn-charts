"use strict";

import { Canvas, Line, Text, Skia } from '@shopify/react-native-skia';
import { getFont } from "../common.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function VerticalLabel({
  minValue,
  maxValue,
  labelCount,
  styles
}) {
  const {
    width,
    height,
    strokeWidth = 2,
    strokeColor = 'white',
    textColor = 'white',
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    fontSize = 12,
    backgroundColor
  } = styles;

  // Generate evenly spaced values
  const stepValue = labelCount > 1 ? (maxValue - minValue) / (labelCount - 1) : 0;
  const labels = Array.from({
    length: labelCount
  }, (_, i) => minValue + i * stepValue);
  const font = getFont(fontSize);
  const usableHeight = height - paddingTop - paddingBottom - fontSize;
  const stepY = labelCount > 1 ? usableHeight / (labelCount - 1) : 0;

  // Precompute text paint
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(textColor));
  return /*#__PURE__*/_jsxs(Canvas, {
    style: {
      width,
      height,
      backgroundColor
    },
    children: [/*#__PURE__*/_jsx(Line, {
      p1: {
        x: width - paddingRight - strokeWidth / 2,
        y: paddingTop
      },
      p2: {
        x: width - paddingRight - strokeWidth / 2,
        y: height - paddingBottom
      },
      color: strokeColor,
      strokeWidth: strokeWidth
    }), labels.map((label, i) => {
      const y = height - paddingBottom - stepY * i;
      const text = label.toFixed(0);

      // measure text width for right-align
      const textWidth = font.measureText(text).width;
      const x = width - paddingRight - strokeWidth - 4 - textWidth;
      return /*#__PURE__*/_jsx(Text, {
        x: x,
        y: y,
        text: text,
        font: font,
        color: textColor
      }, i);
    })]
  });
}
export default VerticalLabel;
//# sourceMappingURL=VerticalLabel.js.map