"use strict";

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Group, Circle } from '@shopify/react-native-skia';
import useRadarChart from "./useRadarChart.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function RadarChart(props) {
  const {
    size,
    cx,
    cy,
    gridPaths,
    axisPaths,
    dataPaths,
    formattedLabels,
    formattedLabelViews,
    strokeWidth,
    strokeColor,
    centerDotRadius,
    centerDotColor
  } = useRadarChart(props);
  return /*#__PURE__*/_jsxs(View, {
    style: [{
      width: size,
      height: size,
      backgroundColor: props.style?.backgroundColor
    }],
    children: [/*#__PURE__*/_jsx(Canvas, {
      style: {
        width: size,
        height: size
      },
      children: /*#__PURE__*/_jsxs(Group, {
        children: [gridPaths.map((gridPath, index) => /*#__PURE__*/_jsx(Path, {
          path: gridPath,
          style: "stroke",
          strokeWidth: strokeWidth,
          color: strokeColor
        }, index)), axisPaths.map((ap, index) => /*#__PURE__*/_jsx(Path, {
          path: ap,
          style: "stroke",
          strokeWidth: strokeWidth,
          color: strokeColor
        }, index)), dataPaths.map((pathDatum, index) => /*#__PURE__*/_jsxs(Group, {
          children: [/*#__PURE__*/_jsx(Path, {
            path: pathDatum.path,
            style: "fill",
            color: pathDatum.backgroundColor
          }), /*#__PURE__*/_jsx(Path, {
            path: pathDatum.path,
            style: "stroke",
            strokeWidth: pathDatum.strokeWidth,
            color: pathDatum.strokeColor
          })]
        }, index)), /*#__PURE__*/_jsx(Circle, {
          cx: cx,
          cy: cy,
          r: centerDotRadius,
          color: centerDotColor
        })]
      })
    }), /*#__PURE__*/_jsxs(View, {
      style: [StyleSheet.absoluteFill, {
        justifyContent: 'center',
        alignItems: 'center'
      }],
      pointerEvents: "none",
      children: [formattedLabelViews && formattedLabelViews.map((viewDataum, index) => {
        let style = {
          position: 'absolute',
          bottom: viewDataum.y
        };
        if (viewDataum.align === 'left') style.left = viewDataum.x;
        if (viewDataum.align === 'right') style.right = viewDataum.x;
        return /*#__PURE__*/_jsx(View, {
          style: style,
          children: viewDataum.view
        }, index);
      }), formattedLabels && formattedLabels.map((formatedlabel, index) => {
        let style = {
          position: 'absolute',
          bottom: formatedlabel.y,
          fontSize: 12,
          includeFontPadding: false
        };
        if (formatedlabel.align === 'left') style.left = formatedlabel.x;
        if (formatedlabel.align === 'right') style.right = formatedlabel.x;
        return /*#__PURE__*/_jsx(Text, {
          style: style,
          children: formatedlabel.label
        }, index);
      })]
    })]
  });
}
export default RadarChart;
//# sourceMappingURL=RadarChart.js.map