"use strict";

import { Fragment } from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Canvas, Rect, Text, vec, Line } from '@shopify/react-native-skia';
import ToolTip from "../Tooltip.js";
import useBarChart from "./useBarChart.js";
import VerticalLabel from "../Common/VerticalLabel.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function BarChart({
  data,
  colors,
  maxValue,
  minValue,
  style
}) {
  const {
    maxValueCalculated,
    minValueCalculated,
    canvasHeight,
    canvasWidth,
    paddingRight,
    paddingLeft,
    paddingBottom,
    paddingTop,
    rectangles,
    verticalLabelWidth,
    chartHeight,
    scrollAreaWidth,
    strokeWidth,
    tooltip,
    bottomLabelHeight,
    font,
    onScroll,
    onCanvasTouchStart
  } = useBarChart(data, style, maxValue, minValue);
  const dragGesture = Gesture.Pan().runOnJS(true).onUpdate(e => {
    onScroll(-e.translationX);
  });
  return /*#__PURE__*/_jsx(GestureHandlerRootView, {
    children: /*#__PURE__*/_jsxs(View, {
      style: {
        width: style?.width,
        flexDirection: 'row',
        backgroundColor: style?.backgroundColor,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingTop: paddingTop,
        paddingBottom: paddingBottom
      },
      children: [/*#__PURE__*/_jsx(VerticalLabel, {
        maxValue: maxValueCalculated,
        minValue: minValueCalculated,
        labelCount: 6,
        styles: {
          width: verticalLabelWidth,
          height: chartHeight,
          strokeWidth
        }
      }), /*#__PURE__*/_jsx(GestureDetector, {
        gesture: dragGesture,
        children: /*#__PURE__*/_jsxs(Canvas, {
          style: {
            width: canvasWidth,
            height: canvasHeight,
            paddingRight: 50,
            backgroundColor: 'red'
          },
          onTouchStart: onCanvasTouchStart,
          children: [/*#__PURE__*/_jsx(Line, {
            p1: vec(0, chartHeight),
            p2: vec(canvasWidth, chartHeight),
            color: "white",
            strokeWidth: strokeWidth
          }), rectangles.map((bar, xIndex) => {
            if (bar.bars.length === 0) return null;
            return /*#__PURE__*/_jsxs(Fragment, {
              children: [/*#__PURE__*/_jsx(Text, {
                x: bar.bars[0].x,
                y: chartHeight + font.getSize() + (bottomLabelHeight - font.getSize()) / 2,
                text: bar.label ?? '',
                color: "white",
                font: font
              }), bar.bars.map((item, yIndex) => {
                let currentData = data[xIndex].values[yIndex];
                let color = colors?.[currentData.id ?? currentData.label] || '#4A90E2';
                if (xIndex === rectangles.length - 1) color = 'pink';else if (xIndex === 0) color = 'lightgreen';
                return /*#__PURE__*/_jsx(Rect, {
                  x: item.x,
                  y: item.y,
                  width: item.width,
                  height: item.height,
                  color: color
                }, xIndex + '-' + yIndex);
              })]
            }, xIndex);
          }), /*#__PURE__*/_jsx(ToolTip, {
            data: tooltip
          })]
        })
      })]
    })
  });
}
export default BarChart;
//# sourceMappingURL=BarChart.js.map