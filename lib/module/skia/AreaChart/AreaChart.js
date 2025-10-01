"use strict";

// AreaChart.tsx
import { Canvas, Circle, Group, Path, Text } from '@shopify/react-native-skia';
import VerticalLabel from "../Common/VerticalLabel.js";
import { View } from 'react-native';
import useAreaChart from "./useAreaChart.js";
import { lighten } from "../../util/colors.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function AreaChart({
  data,
  xLabels,
  minValue: minValueProp,
  maxValue: maxValueProp,
  style
}) {
  const {
    minValue,
    maxValue,
    canvasHeight,
    areaCanvasHeight,
    labelWidth,
    chartWidth,
    paths,
    xLabelsData,
    xLabelHeight,
    font,
    touchLine,
    onCanvasTouchStart
  } = useAreaChart(data, xLabels, maxValueProp, minValueProp, style);
  return /*#__PURE__*/_jsxs(View, {
    style: [style, {
      flexDirection: 'row'
    }],
    children: [/*#__PURE__*/_jsx(VerticalLabel, {
      minValue: minValue,
      maxValue: maxValue,
      styles: {
        height: areaCanvasHeight,
        width: labelWidth,
        fontSize: style?.fontSize
      },
      labelCount: 5
    }), /*#__PURE__*/_jsxs(Canvas, {
      style: {
        width: chartWidth,
        height: canvasHeight
      },
      onTouchStart: onCanvasTouchStart,
      children: [paths.map(({
        path,
        points,
        color
      }, index) => {
        return /*#__PURE__*/_jsxs(Group, {
          children: [/*#__PURE__*/_jsx(Path, {
            path: path,
            color: color
          }), style?.showPoints && color && points.map(points => /*#__PURE__*/_jsx(Circle, {
            cx: points.x,
            cy: points.y,
            r: style?.pointRadius ?? 3,
            color: lighten(color, style?.lightenPointsBy ?? 0.3)
          }, `${points.x}-${points.y}`))]
        }, index);
      }), xLabelsData.map(({
        label,
        xPosition
      }, index) => {
        return /*#__PURE__*/_jsx(Text, {
          x: xPosition,
          y: canvasHeight,
          text: label,
          font: font,
          color: 'white'
        }, index);
      })]
    })]
  });
}
export default AreaChart;
//# sourceMappingURL=AreaChart.js.map