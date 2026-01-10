"use strict";

import { useState } from "react";
import { rect, Skia } from "@shopify/react-native-skia";
import { getRandomRGBColor } from "../common.js";
function deegreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}
function ypoint(angle, radius, cy) {
  return cy - radius * Math.sin(deegreesToRadians(angle));
}
function xpoint(angle, radius, cx) {
  return cx - radius * Math.cos(deegreesToRadians(angle));
}
function getCircularPoints(startAngle, radius, angle, cx, cy) {
  let x1 = xpoint(startAngle, radius, cx);
  let y1 = ypoint(startAngle, radius, cy);
  let x2 = xpoint(startAngle + angle, radius, cx);
  let y2 = ypoint(startAngle + angle, radius, cy);
  return [x1, y1, x2, y2];
}
export function usePieChart({
  slices,
  style,
  onSliceTouch
}) {
  const [popupData, setPopupData] = useState(undefined);
  const radius = style.radius ?? 150;
  const diameter = radius * 2;
  const innerRadius = style.innerRadius ?? 100;
  const cx = radius;
  const cy = radius;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let startAngle = 0;
  const paths = slices.map(({
    value,
    color
  }, index) => {
    const sweepAngle = value / total * 360;
    let [x1, y1, x2, y2] = getCircularPoints(startAngle, radius, sweepAngle, cx, cy);
    let [cx1, cy1, cx2, cy2] = getCircularPoints(startAngle, innerRadius, sweepAngle, cx, cy);
    const path = Skia.Path.Make();
    path.moveTo(cx1, cy1);
    path.lineTo(x1, y1);
    path.addArc(rect(cx - radius, cy - radius, radius * 2, radius * 2), startAngle + 180, sweepAngle);
    path.lineTo(cx2, cy2);
    path.addArc(rect(cx - innerRadius, cy - innerRadius, innerRadius * 2, innerRadius * 2), startAngle + 180 + sweepAngle, -sweepAngle);
    path.lineTo(x1, y1);
    path.close();
    startAngle += sweepAngle;
    return {
      path,
      color: color ?? getRandomRGBColor()
    };
  });
  const touchHandler = (locationX, locationY) => {
    if (!onSliceTouch || locationX < 0 || locationY < 0 || locationX >= diameter || locationY >= diameter) {
      setPopupData(undefined);
      return;
    }
    let foundPath = false;
    let angles = 0;
    paths.forEach(({
      path
    }, index) => {
      let slice = slices[index];
      if (!slice) return;
      let lastAngle = slice.value / total * 360;
      if (path.contains(locationX, locationY)) {
        const label = slice.label || 'Slice';
        const outerX = xpoint(angles + lastAngle / 2, radius, cx);
        const innerX = xpoint(angles + lastAngle / 2, innerRadius, cx);
        const outerY = ypoint(angles + lastAngle / 2, radius, cy);
        const innerY = ypoint(angles + lastAngle / 2, innerRadius, cy);
        const centerY = (outerY + innerY) / 2;
        const centerX = (outerX + innerX) / 2;
        onSliceTouch?.(slice);
        setPopupData({
          centerX: centerX,
          centerY: centerY,
          data: slice
        });
        foundPath = true;
        return;
      }
      angles += lastAngle;
    });
    if (!foundPath) {
      console.log('No slice found at touch location');
      onSliceTouch?.(undefined);
      setPopupData(undefined);
    }
  };
  return {
    paths,
    diameter,
    innerRadius,
    radius,
    popupData,
    touchHandler
  };
}
//# sourceMappingURL=usePieChart.js.map