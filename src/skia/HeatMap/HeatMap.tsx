import React, { useMemo, useState } from 'react';
import { View, StyleSheet, type GestureResponderEvent } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { GestureTouchEvent } from 'react-native-gesture-handler';

type DayData = {
  date: string; // "YYYY-MM-DD"
  value: number;
  dayOfWeek: number;
  week: number;
  x: number;
  y: number;
};

type HeatMapProps = {
  startDate: string;
  endDate: string;
  data?: Record<string, number>;
  cellSize?: number;
  cellGap?: number;
  color?: string;
  minValue?: number;
  maxValue?: number;
  renderPopup?: (day: DayData) => React.ReactNode;
};

function HeatMap({
  startDate,
  endDate,
  data,
  cellSize = 24,
  cellGap = 4,
  color = '#4CAF50',
  minValue,
  maxValue,
  renderPopup,
}: HeatMapProps) {
  const {} = useHeatMap();
  const [selectedDay, setSelectedDay] = useState<DayData | undefined>(
    undefined
  );
  const [popupPos, setPopupPos] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  // Helper to format dates
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;

  const numberOfDaysInWeek = 7;
  const numberOfMsInDay = 1000 * 60 * 60 * 24;
  // Generate all days between startDate and endDate (inclusive)
  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDays: DayData[] = [];
    let startDayOfWeek = start.getDay();

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = formatDate(date);
      const value = data?.[dateStr] ?? 0;
      let dayOfWeek = date.getDay();
      let week = 0;

      let numberOfDaysFromStart = Math.floor(
        (date.getTime() - start.getTime()) / numberOfMsInDay
      );

      week = Math.floor(
        (startDayOfWeek + numberOfDaysFromStart) / numberOfDaysInWeek
      );

      allDays.push({
        date: dateStr,
        value: value,
        dayOfWeek,
        week,
        x: week * (cellSize + cellGap),
        y: dayOfWeek * (cellSize + cellGap),
      });
    }
    return allDays;
  }, [startDate, endDate, data]);

  const computedMax =
    maxValue !== undefined
      ? maxValue
      : Math.max(...daysInRange.map((d) => d.value));
  const computedMin =
    minValue !== undefined
      ? minValue
      : Math.min(...daysInRange.map((d) => d.value));

  // Color computation based on intensity
  const getColor = (value: number) => {
    if (value <= 0) return '#e0e0e0';
    const intensity = Math.min(
      1,
      Math.max(0, (value - computedMin) / (computedMax - computedMin || 1))
    );

    const bigint = parseInt(color.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const mix = (base: number) => Math.round(255 - (255 - base) * intensity);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  };

  const numWeeks = Math.ceil(daysInRange.length / 7 + 1);

  const totalWidth = numWeeks * (cellSize + cellGap);
  const totalHeight = 7 * (cellSize + cellGap);

  // Skia touch handler
  const touchHandler = (touch: GestureResponderEvent) => {
    const x = touch.nativeEvent.locationX;
    const y = touch.nativeEvent.locationY;
    const col = Math.floor(x / (cellSize + cellGap));
    const row = Math.floor(y / (cellSize + cellGap));
    const start = new Date(startDate);
    let startDayOfWeek = start.getDay();

    const index = col * numberOfDaysInWeek + row;
    if (
      index >= startDayOfWeek &&
      index - startDayOfWeek < daysInRange.length
    ) {
      const day = daysInRange[index - startDayOfWeek];
      setSelectedDay(day);
      setPopupPos({ x, y });
    } else {
      setSelectedDay(undefined);
      setPopupPos(undefined);
    }
  };

  return (
    <View>
      <Canvas
        style={{ width: totalWidth, height: totalHeight }}
        onTouchStart={touchHandler}
      >
        <Group>
          {daysInRange.map((day, i) => {
            return (
              <Rect
                key={day.date}
                x={day.x}
                y={day.y}
                width={cellSize}
                height={cellSize}
                color={getColor(day.value)}
              />
            );
          })}
        </Group>
      </Canvas>

      {selectedDay && popupPos && renderPopup && (
        <View
          style={[
            {
              position: 'absolute',
              left: Math.max(0, popupPos.x - cellSize / 2),
              top: Math.max(0, popupPos.y - cellSize / 2),
            },
          ]}
        >
          {renderPopup(selectedDay)}
        </View>
      )}
    </View>
  );
}

export default HeatMap;
