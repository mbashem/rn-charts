"use strict";

// BarChart.tsx
import React, { Fragment, useMemo, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Canvas, Rect, Text, vec, Line } from "@shopify/react-native-skia";
import { arrayFrom, getFormattedString, isDefined } from "../util/util.js";
import { font } from "./common.js";
import ToolTip from "./Tooltip.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function BarChart({
  data,
  colors,
  maxValue,
  minValue,
  style
}) {
  console.log(React.version, "BarChart");
  const {
    maxValueCalculated
  } = useMemo(() => {
    if (isDefined(maxValue) && isDefined(minValue)) {
      return {
        maxValueCalculated: maxValue
      };
    }
    if (data.length === 0) {
      return {
        maxValueCalculated: 100,
        steps: arrayFrom(100, 20)
      };
    }
    let maxValueCalculated = Number.MIN_VALUE;
    data.forEach(item => {
      const currentValue = item.values.reduce((acc, value) => acc + value.value, 0);
      maxValueCalculated = Math.max(maxValueCalculated, currentValue);
    });
    return {
      maxValueCalculated,
      steps
    };
  }, [data, maxValue]);
  const {
    width: windowWidth
  } = useWindowDimensions();
  const [tooltip, setTooltip] = useState(undefined);
  const minValueCalculated = minValue ?? 0;
  const steps = useMemo(() => arrayFrom(1, 0.2), []);
  const paddingRight = style?.paddingRight ?? style?.padding ?? 10;
  const paddingLeft = style?.paddingLeft ?? style?.padding ?? 10;
  const chartBarWidth = style?.barWidth ?? 100;
  const chartBarSpacing = style?.spacing ?? 20;
  const ySpace = 40;
  const chartWidth = useMemo(() => {
    if (isDefined(style?.width)) return style.width;
    return chartBarSpacing * data.length + data.length * chartBarWidth + ySpace + paddingRight + paddingLeft;
  }, [style?.width, windowWidth]);
  const onCanvasTouchStart = event => {
    let leftExtraXSpace = paddingLeft + ySpace + strokeWidth;
    let xIndex = event.nativeEvent.locationX - leftExtraXSpace;
    xIndex = Math.floor(xIndex / (chartBarWidth + chartBarSpacing));
    let startingXIndex = xIndex * (chartBarWidth + chartBarSpacing) + leftExtraXSpace;
    if (startingXIndex + chartBarWidth < event.nativeEvent.locationX) {
      console.log("Touch is outside the bar width, ignoring.");
      setTooltip(undefined);
      return;
    }
    let yIndex = 0;
    let yPassed = 0;
    let categoryData = data[xIndex]?.values || [];
    while (yIndex < categoryData.length && yPassed < chartHeight - event.nativeEvent.locationY + paddingTop) {
      const barHeight = (categoryData[yIndex].value - minValueCalculated) / (maxValueCalculated - minValueCalculated) * chartHeight;
      yPassed += barHeight;
      yIndex++;
    }
    if (yIndex === 0) {
      setTooltip(undefined);
      return;
    }
    setTooltip({
      x: startingXIndex,
      y: chartHeight - yPassed - paddingTop,
      label: categoryData[yIndex - 1].label || " :u "
    });
  };
  const chartHeight = style?.height ?? 200;
  const paddingBottom = 30;
  const paddingTop = 10;
  const xSpace = paddingTop + 5;
  const strokeWidth = 2;
  return /*#__PURE__*/_jsx(ScrollView, {
    horizontal: true,
    onScroll: () => setTooltip(undefined),
    children: /*#__PURE__*/_jsxs(Canvas, {
      style: {
        width: chartWidth,
        height: chartHeight + paddingBottom + paddingTop,
        backgroundColor: "black"
      },
      onTouchStart: onCanvasTouchStart,
      children: [/*#__PURE__*/_jsx(Line, {
        p1: vec(ySpace + paddingLeft, chartHeight + paddingTop),
        p2: vec(chartWidth - paddingRight, chartHeight + paddingTop),
        color: "white",
        strokeWidth: strokeWidth
      }), /*#__PURE__*/_jsx(Line, {
        p1: vec(ySpace + paddingLeft, paddingTop),
        p2: vec(ySpace + paddingLeft, chartHeight + paddingTop),
        color: "white",
        strokeWidth: strokeWidth
      }), steps.map((value, index) => /*#__PURE__*/_jsx(Text, {
        x: paddingLeft,
        y: chartHeight - value * chartHeight + xSpace,
        text: getFormattedString(value * maxValueCalculated).toString(),
        color: "white",
        font: font
      }, index)), data.map((bar, xIndex) => {
        let previousHeight = 0;
        const x = xIndex * (chartBarWidth + chartBarSpacing) + ySpace + strokeWidth + paddingLeft;
        return /*#__PURE__*/_jsxs(Fragment, {
          children: [/*#__PURE__*/_jsx(Text, {
            x: x,
            y: chartHeight + paddingTop + 20,
            text: bar.label,
            color: "white",
            font: font
          }), bar.values.map((item, yIndex) => {
            const barHeight = (item.value - minValueCalculated) / (maxValueCalculated - minValueCalculated) * chartHeight;
            const y = chartHeight - barHeight - previousHeight + paddingTop - strokeWidth;
            let color = colors?.[item.id ?? item.label] || "#4A90E2";
            previousHeight += barHeight;
            return /*#__PURE__*/_jsx(Rect, {
              x: x,
              y: y,
              width: chartBarWidth,
              height: barHeight,
              color: color
            }, xIndex + "-" + yIndex);
          })]
        }, xIndex);
      }), /*#__PURE__*/_jsx(ToolTip, {
        data: tooltip
      })]
    })
  });
}
export default BarChart;
//# sourceMappingURL=BarChart.js.map