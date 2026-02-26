import type { View } from "react-native-reanimated/lib/typescript/Animated";
import type { CellDatum, HeatMapProps } from "./HeatMap";
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getPaddings } from "../common";
import { rect, type SkHostRect } from "@shopify/react-native-skia";

function useHeatMap({
  rows,
  data,
  style,
  minValue,
  maxValue,
  coalesceGroups,
  ref,
  popupStyle
}: HeatMapProps) {

  const cellSize = style?.cellSize ?? 24;
  const cellGap = style?.cellGap ?? 4;
  const cellMaxColor = style?.cellMaxColor ?? '#50f555ff';
  const cellMinColor = style?.cellMinColor ?? '#ffffffff';

  const [verticalLabelWidth, setVerticalLabelWidth] = useState<number>(0);
  const [horizontalLabelHeight, setHorizontalLabelHeight] = useState<number>(0);
  const {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom
  } = getPaddings(style);

  const numberOfRows = rows;
  const [popupData, setPopupData] = useState<
    { x: number; y: number; data: CellDatum; } | undefined
  >(undefined);

  const [popupDimension, setPopupDimension] = useState({
    width: 0,
    height: 0,
  });

  const popupRef = useRef<View>(null);

  const { cellData, computedMin, computedMax, numberOfCols, totalInterGroupSpacing, xLabelsRect, groupInfos } = useMemo(() => {
    let computedMax = Number.MIN_VALUE;
    let computedMin = Number.MAX_VALUE;

    let nextRow = 0;
    let nextCol = 0;
    let xLabelsRect: SkHostRect[] = [];

    let cellsInRange: CellDatum[] = [];
    let totalInterGroupSpacing = 0;
    let groupInfos: { startingX: number, endingX: number, startingCellIndex: number, lastCellIndex: number; }[] = [];

    data.forEach((datum, index) => {
      let startingRow = datum.startingRow;
      let currentCol = nextCol;

      if (index !== 0 && (coalesceGroups === false || datum.startingRow < nextRow)) {
        currentCol++;
        let additionalGroupSpacing = coalesceGroups ? 0 : (style?.interGroupSpacing ?? 0);
        totalInterGroupSpacing += additionalGroupSpacing;
      }

      let minX = Number.MAX_VALUE;
      let maxX = Number.MIN_VALUE;
      let firstIndexInGroup = cellsInRange.length;
      let lastIndexInGroup = firstIndexInGroup;

      for (let i = 0; i < datum.cols; i++) {
        for (let j = startingRow; j < (i === datum.cols - 1 ? datum.endingRow + 1 : rows); j++) {
          const value = datum.data?.[j]?.[i] ?? 0;
          computedMax = Math.max(computedMax, value);
          computedMin = Math.min(computedMin, value);

          let x = currentCol * (cellSize + cellGap) + totalInterGroupSpacing;
          let y = j * (cellSize + cellGap);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          cellsInRange.push({
            rowIndex: j,
            colIndex: currentCol,
            groupIndex: data.indexOf(datum),
            value,
            x: x,
            y: y,
          });
          lastIndexInGroup = cellsInRange.length - 1;
          nextRow = j + 1;
        }

        startingRow = 0;
        if (nextRow == rows) {
          currentCol++;
          nextRow = 0;
        }
      }

      nextCol = Math.max(nextCol, currentCol);
      xLabelsRect.push(rect(minX, 0, maxX - minX + cellSize, style?.horizontalLabelStyle?.height ?? -1));
      groupInfos.push({
        startingX: minX,
        endingX: maxX + cellSize,
        startingCellIndex: firstIndexInGroup,
        lastCellIndex: lastIndexInGroup
      });
    });

    return {
      cellData: cellsInRange,
      numberOfCols: nextCol + (nextRow > 0 ? 1 : 0),
      totalInterGroupSpacing,
      xLabelsRect,
      groupInfos,
      computedMin: minValue !== undefined ? minValue : computedMin,
      computedMax: maxValue !== undefined ? maxValue : computedMax,
    };
  }, [rows, data, minValue, maxValue, cellSize, cellGap]);

  // --- COLOR LOGIC ---
  const getColor = (value: number) => {
    if (value <= 0) return cellMinColor;

    const intensity = Math.min(
      1,
      Math.max(0, (value - computedMin) / (computedMax - computedMin || 1))
    );

    const bigint = parseInt(cellMaxColor.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const mix = (base: number) => Math.round(255 - (255 - base) * intensity);

    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  };

  // Heatmap size
  const totalWidth = numberOfCols * (cellSize + cellGap) + totalInterGroupSpacing + verticalLabelWidth;
  const totalHeight = rows * (cellSize + cellGap) + horizontalLabelHeight;

  // --- POPUP MEASUREMENT ---
  useLayoutEffect(() => {
    if (popupRef.current) {
      popupRef.current.measure((x, y, width, height) => {
        setPopupDimension({ width, height });
      });
    }
  }, [popupData]);

  // --- TOUCH HANDLER ---
  const touchHandler = (x: number, y: number) => {
    if (!popupStyle?.renderPopup || (x < 0 || y < 0 || x >= totalWidth || y >= totalHeight)) {
      setPopupData(undefined);
      return;
    }

    let cellIndex: number | undefined = undefined;

    for (const [index, group] of groupInfos.entries()) {
      if (x > group.endingX) continue;
      if (x < group.startingX) continue;

      let groupData = data[index];
      if (!groupData) break;

      let colIndex = Math.floor((x - group.startingX) / (cellSize + cellGap));
      let rowIndex = Math.floor(y / (cellSize + cellGap));
      let firstRowCells = rows - groupData.startingRow;

      if (colIndex < 0 || colIndex >= groupData.cols || rowIndex < 0 || rowIndex >= rows) {
        break;
      }

      let cellColStartingCellIndex = group.startingCellIndex + Math.max(0, colIndex - 1) * rows;
      if (colIndex !== 0) {
        cellColStartingCellIndex += firstRowCells;
        cellIndex = cellColStartingCellIndex + rowIndex;
      } else {
        cellIndex = cellColStartingCellIndex + rowIndex - groupData.startingRow;
      }

      if (cellIndex < 0 || cellIndex >= cellData.length) {
        console.error("Calculated cell index is out of bounds:", cellIndex);
        cellIndex = undefined;
        break;
      }
      let cell = cellData[cellIndex];
      if (!cell || x < cell.x || x > cell.x + cellSize || y < cell.y || y > cell.y + cellSize) {
        cellIndex = undefined;
      }
      break;
    }

    if (cellIndex === undefined) {
      setPopupData(undefined);
      return;
    }
    const cellDatum = cellData[cellIndex];
    if (cellDatum) {
      setPopupData({
        x: cellDatum.x,
        y: cellDatum.y,
        data: cellDatum,
      });
      return;
    }

    setPopupData(undefined);
  };
  const onTouchOutside = () => {
    setPopupData(undefined);
  };

  useImperativeHandle(ref, () => ({
    touchedOutside: () => {
      setPopupData(undefined);
    }
  }), [ref]);

  return {
    cellData,
    computedMin,
    computedMax,
    totalWidth,
    totalHeight,
    popupData,
    popupRef,
    popupDimension,
    touchHandler,
    getColor,
    cellSize,
    onTouchOutside,
    verticalLabelWidth,
    setVerticalLabelWidth,
    horizontalLabelHeight,
    setHorizontalLabelHeight,
    numberOfRows,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    xLabelsRect
  };
}

export default useHeatMap;