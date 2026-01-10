"use strict";

import { Canvas, Path } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { usePieChart } from "./usePieChart.js";
import Popup from "../Popup.js";
import { useState } from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function PieChart(props) {
  const {
    radius,
    innerRadius,
    paths,
    popupData,
    touchHandler
  } = usePieChart(props);
  const {
    style,
    centerView,
    popupStyle
  } = props;
  const paddingTop = style.paddingTop ?? style.padding ?? 0;
  const paddingBottom = style.paddingBottom ?? style.padding ?? 0;
  const paddingLeft = style.paddingLeft ?? style.padding ?? 0;
  const paddingRight = style.paddingRight ?? style.padding ?? 0;
  const [viewOffset, setViewOffset] = useState({
    x: 0,
    y: 0
  });
  return /*#__PURE__*/_jsxs(View, {
    style: {
      paddingTop: paddingTop,
      paddingBottom: paddingBottom,
      paddingRight: paddingRight,
      paddingLeft: paddingLeft,
      backgroundColor: style.backgroundColor ?? 'transparent'
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
    }), /*#__PURE__*/_jsx(Canvas, {
      style: {
        width: radius * 2,
        height: radius * 2,
        backgroundColor: style.backgroundColor ?? 'transparent'
      },
      onTouchStart: event => touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY),
      children: paths.map(({
        path,
        color
      }, index) => /*#__PURE__*/_jsx(Path, {
        path: path,
        color: color,
        stroke: {
          width: 5
        }
      }, index))
    }), popupData && /*#__PURE__*/_jsx(Popup, {
      popupData: {
        x: popupData.centerX,
        y: popupData.centerY,
        data: popupData.data
      },
      totalWidth: radius * 2,
      totalHeight: radius * 2,
      touchHandler: (x, y) => touchHandler(x - paddingLeft, y - paddingTop),
      viewOffset: viewOffset,
      popupStyle: popupStyle
    })]
  });
}
export default PieChart;
//# sourceMappingURL=PieChart.js.map