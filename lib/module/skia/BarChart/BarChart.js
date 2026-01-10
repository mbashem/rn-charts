"use strict";

import { Fragment, useState } from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Canvas, Rect, Text, vec, Line } from '@shopify/react-native-skia';
import useBarChart from "./useBarChart.js";
import VerticalLabel from "../Common/VerticalLabel.js";
import Popup from "../Popup.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function BarChart(props) {
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
    strokeWidth,
    tooltip,
    bottomLabelHeight,
    font,
    onScroll,
    touchHandler,
    totalHeight,
    totalWidth
  } = useBarChart(props);
  const dragGesture = Gesture.Pan().runOnJS(true).onChange(event => {
    onScroll(-event.changeX);
  });
  const [viewOffset, setViewOffset] = useState({
    x: 0,
    y: 0
  });
  return /*#__PURE__*/_jsx(GestureHandlerRootView, {
    children: /*#__PURE__*/_jsxs(View, {
      style: {
        width: totalWidth,
        flexDirection: 'row',
        backgroundColor: props.style?.backgroundColor,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingTop: paddingTop,
        paddingBottom: paddingBottom
      },
      ref: view => {
        view?.measureInWindow((fx, fy) => {
          setViewOffset(prev => {
            if (prev.x === fx && prev.y === fy) {
              return prev;
            }
            return {
              x: fx,
              y: fy
            };
          });
        });
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
          onTouchStart: event => touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY),
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
                let currentData = props.data[xIndex].values[yIndex];
                let color = props?.colors?.[currentData.id ?? currentData.label] || '#4A90E2';
                return /*#__PURE__*/_jsx(Rect, {
                  x: item.x,
                  y: item.y,
                  width: item.width,
                  height: item.height,
                  color: color
                }, xIndex + '-' + yIndex);
              })]
            }, xIndex);
          })]
        })
      }), tooltip && /*#__PURE__*/_jsx(Popup, {
        popupData: {
          x: tooltip.centerX,
          y: tooltip.centerY,
          data: tooltip.data
        },
        popupStyle: props.popupStyle,
        totalWidth: totalWidth,
        totalHeight: totalHeight,
        touchHandler: (x, y) => touchHandler(x - verticalLabelWidth - paddingLeft, y - paddingTop),
        viewOffset: viewOffset
      })]
    })
  });
}
export default BarChart;
//# sourceMappingURL=BarChart.js.map