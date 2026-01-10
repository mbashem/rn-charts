"use strict";

// AreaChart.tsx
import { Canvas, Circle, Group, Path, Text } from '@shopify/react-native-skia';
import VerticalLabel from "../Common/VerticalLabel.js";
import { View } from 'react-native';
import useAreaChart from "./useAreaChart.js";
import { useState } from 'react';
import { lighten } from "../../util/colors.js";
import Popup from "../Popup.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function AreaChart(props) {
  const {
    minValue,
    maxValue,
    canvasHeight,
    areaCanvasHeight,
    labelWidth,
    chartWidth,
    paths,
    xLabelsData,
    paddingLeft,
    paddingTop,
    paddingHorizontal,
    font,
    touchLine,
    touchHandler
  } = useAreaChart(props);
  const {
    style,
    popupStyle
  } = props;
  const [viewOffset, setViewOffset] = useState({
    x: 0,
    y: 0
  });
  console.log('AreaChart render', {
    touchLine
  });
  return /*#__PURE__*/_jsxs(View, {
    style: [style, {
      flexDirection: 'row'
    }],
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
      onTouchStart: event => touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY),
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
    }), touchLine && /*#__PURE__*/_jsx(Popup, {
      popupData: touchLine.y.map((y, index) => ({
        x: touchLine.x,
        y: y,
        data: {
          rowIndex: index,
          colIndex: touchLine.col,
          value: touchLine.values[index]
        }
      })),
      totalWidth: chartWidth + labelWidth + paddingHorizontal,
      totalHeight: canvasHeight,
      touchHandler: (x, y) => {
        console.log('Popup touchHandler', x, y);
        touchHandler(x - labelWidth - paddingLeft, y - paddingTop);
      },
      viewOffset: viewOffset,
      popupStyle: popupStyle
    })]
  });
}
export default AreaChart;
//# sourceMappingURL=AreaChart.js.map