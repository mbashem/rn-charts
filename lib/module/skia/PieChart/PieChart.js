"use strict";

import { Canvas, Path } from '@shopify/react-native-skia';
import { View } from 'react-native';
import ToolTip from "../Tooltip.js";
import { usePieChart } from "./usePieChart.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function PieChart({
  style,
  slices,
  centerView,
  onSliceTouch,
  showTooltipOnTouch
}) {
  const {
    radius,
    innerRadius,
    paths,
    tooltip,
    onCanvasTouchStart
  } = usePieChart(slices, style, onSliceTouch, showTooltipOnTouch);
  const paddingTop = style.paddingTop ?? style.padding ?? 0;
  const paddingBottom = style.paddingBottom ?? style.padding ?? 0;
  const paddingLeft = style.paddingLeft ?? style.padding ?? 0;
  const paddingRight = style.paddingRight ?? style.padding ?? 0;
  return /*#__PURE__*/_jsxs(View, {
    style: {
      paddingTop: paddingTop,
      paddingBottom: paddingBottom,
      paddingRight: paddingRight,
      paddingLeft: paddingLeft,
      backgroundColor: style.backgroundColor ?? 'transparent'
    },
    children: [centerView && /*#__PURE__*/_jsx(View, {
      style: {
        position: 'absolute',
        top: paddingTop + radius - innerRadius,
        left: paddingLeft + radius - innerRadius,
        width: innerRadius * 2,
        height: innerRadius * 2,
        borderRadius: innerRadius,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: style.innerColor ?? 'black'
      },
      children: centerView
    }), /*#__PURE__*/_jsxs(Canvas, {
      style: {
        width: radius * 2,
        height: radius * 2,
        backgroundColor: style.backgroundColor ?? 'transparent'
      },
      onTouchStart: onCanvasTouchStart,
      children: [paths.map(({
        path,
        color
      }, index) => /*#__PURE__*/_jsx(Path, {
        path: path,
        color: color,
        stroke: {
          width: 5
        }
      }, index)), /*#__PURE__*/_jsx(ToolTip, {
        data: tooltip,
        style: {
          padding: 5
        }
      })]
    })]
  });
}
export default PieChart;
//# sourceMappingURL=PieChart.js.map