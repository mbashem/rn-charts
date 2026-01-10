"use strict";

import React from 'react';
import { View } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import useHeatMap from "./useHeatMap.js";
import Popup from "../Popup.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function HeatMap(props) {
  const {
    daysInRange,
    totalWidth,
    totalHeight,
    popupData,
    popupRef,
    popupDimension,
    touchHandler,
    getColor,
    cellSize,
    onTouchOutside
  } = useHeatMap(props);
  const [viewOffset, setViewOffset] = React.useState({
    x: 0,
    y: 0
  });
  return /*#__PURE__*/_jsxs(View, {
    style: {
      backgroundColor: props.style?.backgroundColor
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
    children: [/*#__PURE__*/_jsx(Canvas, {
      style: {
        width: totalWidth,
        height: totalHeight
      },
      onTouchStart: event => touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY),
      children: /*#__PURE__*/_jsx(Group, {
        children: daysInRange.map(day => {
          return /*#__PURE__*/_jsx(Rect, {
            x: day.x,
            y: day.y,
            width: cellSize,
            height: cellSize,
            color: getColor(day.value)
          }, day.date);
        })
      })
    }), popupData && props.popupStyle && /*#__PURE__*/_jsx(Popup, {
      popupData: {
        x: popupData.x,
        y: popupData.y,
        data: popupData.day
      },
      totalWidth: totalWidth,
      totalHeight: totalHeight,
      touchHandler: touchHandler,
      onTouchOutside: onTouchOutside,
      popupStyle: props.popupStyle,
      viewOffset: viewOffset
    })]
  });
}
export default HeatMap;
//# sourceMappingURL=HeatMap.js.map