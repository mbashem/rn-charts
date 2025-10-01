"use strict";

import { Skia } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { getCommonStyleFont, getPaddings } from "../common.js";
import { isDefined } from "../../util/util.js";
function useAreaChart(data, xLabels, maxValue, minValue, style) {
  const height = style?.height ?? 200;
  const width = style?.width ?? 200;
  const {
    paddingHorizontal,
    paddingVertical
  } = getPaddings(style);
  const canvasHeight = height - paddingVertical;
  const labelWidth = 30;
  const chartWidth = width - labelWidth - paddingHorizontal;
  const xLabelHeight = xLabels && xLabels.length > 0 ? (style?.fontSize ?? 12) + 5 : 0;
  const areaCanvasHeight = canvasHeight - xLabelHeight;
  const {
    font
  } = getCommonStyleFont(style);
  const {
    maxValueCalculated,
    minValueCalculated
  } = useMemo(() => {
    if (isDefined(maxValue) && isDefined(minValue)) {
      return {
        maxValueCalculated: maxValue,
        minValueCalculated: minValue
      };
    }
    let maxValueCalculated = Number.MIN_VALUE;
    let minValueCalculated = Number.MAX_VALUE;
    data.forEach(datum => {
      datum.values.forEach(value => {
        if (value > maxValueCalculated && !isDefined(maxValue)) {
          maxValueCalculated = value;
        }
        if (value < minValueCalculated && !isDefined(minValue)) {
          minValueCalculated = value;
        }
      });
    });
    return {
      maxValueCalculated,
      minValueCalculated
    };
  }, [data]);
  const paths = useMemo(() => {
    const pathData = [];
    for (let datum of data) {
      const areaData = datum.values;
      const stepX = width / areaData.length;
      const p = Skia.Path.Make();
      p.moveTo(0, areaCanvasHeight);
      const points = [];
      areaData.forEach((y, i) => {
        const xPos = i * stepX;
        const yPos = Math.max(0, areaCanvasHeight - (y - minValueCalculated) / (maxValueCalculated - minValueCalculated) * areaCanvasHeight);
        points.push({
          x: xPos,
          y: yPos
        });
        p.lineTo(xPos, yPos);
      });
      p.lineTo(width, areaCanvasHeight);
      p.close();
      pathData.push({
        path: p,
        points,
        color: datum.color,
        label: datum.label
      });
    }
    return pathData;
  }, [data, maxValueCalculated, minValueCalculated]);
  const xLabelsData = useMemo(() => {
    if (!xLabels || xLabels.length === 0) {
      return [];
    }
    const stepX = chartWidth / xLabels.length;
    const labels = xLabels.map((label, i) => {
      return {
        label,
        xPosition: i * stepX + font.getSize()
      };
    });
    return labels;
  }, [xLabels, chartWidth]);
  const [touchLine, setTouchLine] = useState(undefined);
  const onCanvasTouchStart = event => {
    const xIndex = event.nativeEvent.locationX;
    const yIndex = event.nativeEvent.locationY;

    // setTouchLine({
    // 	x: xIndex,
    // });
  };
  return {
    paths,
    chartWidth,
    canvasHeight,
    areaCanvasHeight,
    labelWidth,
    maxValue: maxValueCalculated,
    minValue: minValueCalculated,
    xLabelsData,
    xLabelHeight,
    font,
    onCanvasTouchStart,
    touchLine
  };
}
export default useAreaChart;
//# sourceMappingURL=useAreaChart.js.map