import type { View } from "react-native-reanimated/lib/typescript/Animated";
import type { DayData, HeatMapProps } from "./HeatMap";
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";

function useHeatMap({
  startDate,
  endDate,
  data,
  style,
  minValue,
  maxValue,
  ref,
  popupStyle
}: HeatMapProps) {

  const cellSize = style?.cellSize ?? 24;
  const cellGap = style?.cellGap ?? 4;
  const cellMaxColor = style?.cellMaxColor ?? '#50f555ff';
  const cellMinColor = style?.cellMinColor ?? '#ffffffff';

  const numberOfDaysInWeek = 7;
  const numberOfMsInDay = 1000 * 60 * 60 * 24;

  const [popupData, setPopupData] = useState<
    { x: number; y: number; day: DayData; } | undefined
  >(undefined);

  const [popupDimension, setPopupDimension] = useState({
    width: 0,
    height: 0,
  });

  const popupRef = useRef<View>(null);

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;

  const { daysInRange, computedMin, computedMax } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const output: DayData[] = [];
    let computedMax = Number.MIN_VALUE;
    let computedMin = Number.MAX_VALUE;

    const startDayOfWeek = start.getDay();

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      const value = data?.[dateStr] ?? 0;

      const dayOfWeek = d.getDay();
      const daysFromStart = Math.floor(
        (d.getTime() - start.getTime()) / numberOfMsInDay
      );

      const week = Math.floor(
        (startDayOfWeek + daysFromStart) / numberOfDaysInWeek
      );

      computedMax = Math.max(computedMax, value);
      computedMin = Math.min(computedMin, value);

      output.push({
        date: dateStr,
        value,
        dayOfWeek,
        week,
        x: week * (cellSize + cellGap),
        y: dayOfWeek * (cellSize + cellGap),
      });
    }

    return {
      daysInRange: output,
      computedMin: minValue !== undefined ? minValue : computedMin,
      computedMax: maxValue !== undefined ? maxValue : computedMax,
    };
  }, [startDate, endDate, data, minValue, maxValue, cellSize, cellGap]);

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
  const numWeeks = Math.ceil(daysInRange.length / 7 + 1);
  const totalWidth = numWeeks * (cellSize + cellGap);
  const totalHeight = 7 * (cellSize + cellGap);

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

    const col = Math.floor(x / (cellSize + cellGap));
    const row = Math.floor(y / (cellSize + cellGap));

    const start = new Date(startDate);
    const startDayOfWeek = start.getDay();

    const index = col * numberOfDaysInWeek + row;

    if (
      index >= startDayOfWeek &&
      index - startDayOfWeek < daysInRange.length
    ) {
      const day = daysInRange[index - startDayOfWeek];
      if (day) {
        setPopupData({
          x: col * (cellSize + cellGap),
          y: row * (cellSize + cellGap),
          day,
        });
        return;
      }
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
    daysInRange,
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
    onTouchOutside
  };
}

export default useHeatMap;