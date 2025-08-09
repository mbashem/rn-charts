"use strict";

// PieChart.tsx
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { getRandomRGBColor } from "./common.js";
import { View } from "react-native";
import { jsx as _jsx } from "react/jsx-runtime";
function PieChart({
  slices,
  styles
}) {
  const diameter = styles.diameter ?? 300;
  const radius = diameter / 2;
  const cx = radius;
  const cy = radius;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let startAngle = 0;
  const paths = slices.map(({
    value,
    color
  }, index) => {
    const sweepAngle = value / total * 360;
    const startRad = Math.PI / 180 * startAngle;
    const endRad = Math.PI / 180 * (startAngle + sweepAngle);
    let x1 = cx + radius * Math.cos(startRad);
    let y1 = cy + radius * Math.sin(startRad);
    let x2 = cx + radius * Math.cos(endRad);
    let y2 = cy + radius * Math.sin(endRad);
    x1 = diameter - x1;
    y1 = diameter - y1;
    x2 = diameter - x2;
    y2 = diameter - y2;
    console.log(x1, y1, x2, y2, cx, cy, radius, startAngle, sweepAngle);
    const largeArc = sweepAngle > 180 ? 1 : 0;
    const path = Skia.Path.Make();
    // if (index == 0) {
    // path.moveTo(cx, cy);
    // path.lineTo(cx - radius, cy);
    // path.arcToRotated(cx, cy, sweepAngle, false, false, cx, cy + radius);
    // path.lineTo(cx, cy);
    path.moveTo(cx, cy);
    path.lineTo(x1, y1);
    path.arcToRotated(cx, cy, sweepAngle, sweepAngle < 180, false, x2, y2);
    path.lineTo(cx, cy);
    // }
    path.close();
    startAngle += sweepAngle;
    return {
      path,
      color: color ?? getRandomRGBColor()
    };
  });
  return /*#__PURE__*/_jsx(View, {
    style: {
      flex: 1,
      padding: 16
    },
    children: /*#__PURE__*/_jsx(Canvas, {
      style: {
        width: styles.diameter,
        height: styles.diameter,
        backgroundColor: "gray"
      },
      children: paths.map(({
        path,
        color
      }, index) => /*#__PURE__*/_jsx(Path, {
        path: path,
        color: color
      }, index))
    })
  });
}
export default PieChart;
//# sourceMappingURL=PieChart.js.map