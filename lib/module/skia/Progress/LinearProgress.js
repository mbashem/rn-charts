"use strict";

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, LinearGradient, RoundedRect } from '@shopify/react-native-skia';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function LinearProgress({
  progress,
  style
}) {
  const width = style.width ?? 300;
  const height = style.height ?? 20;
  const radius = style.radius ?? 0;
  const tintColor = style.tintColor ?? '#4A90E2';

  // Animate progress
  useEffect(() => {
    // runTiming(progress, 0.7, { duration: 1000 }); // progress to 70%
  }, []);
  return /*#__PURE__*/_jsx(View, {
    children: /*#__PURE__*/_jsxs(Canvas, {
      style: {
        width,
        height
      },
      children: [/*#__PURE__*/_jsx(RoundedRect, {
        x: 0,
        y: 0,
        width: width,
        height: height,
        r: radius,
        color: style.backgroundColor,
        children: style.backgroundColors && /*#__PURE__*/_jsx(LinearGradient, {
          start: {
            x: 0,
            y: 0
          },
          end: {
            x: width,
            y: 0
          },
          colors: style.backgroundColors,
          positions: style.backgroundColorsPositions
        })
      }), /*#__PURE__*/_jsx(RoundedRect, {
        x: 0,
        y: 0,
        width: progress * width // animate width
        ,
        height: height,
        r: radius,
        color: style.tintColor,
        children: style.tintColors && /*#__PURE__*/_jsx(LinearGradient, {
          start: {
            x: 0,
            y: 0
          },
          end: {
            x: width,
            y: 0
          },
          colors: style.tintColors,
          positions: style.tineColorsPositions
        })
      })]
    })
  });
}
//# sourceMappingURL=LinearProgress.js.map