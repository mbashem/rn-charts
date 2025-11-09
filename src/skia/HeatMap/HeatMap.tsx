import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';

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
  data: DayData[];
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
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Helper to format dates
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;

  // Generate all days between startDate and endDate (inclusive)
  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDays: DayData[] = [];
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = formatDate(date);
      const found = data.find((x) => x.date === dateStr);
      let dayOfWeek = date.getDay();
      let week = 0;
      let numberOfDaysInWeek = 7;
      let numberOfMsInDay = 1000 * 60 * 60 * 24;

      let numberOfDaysFromStart = Math.floor(
        (date.getTime() - start.getTime()) / numberOfMsInDay
      );

      let startDayOfWeek = start.getDay();

      week = Math.floor((startDayOfWeek + numberOfDaysFromStart) / 7);

      allDays.push({
        date: dateStr,
        value: found ? found.value : 0,
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

  const numWeeks = Math.ceil(daysInRange.length / 7);

  const totalWidth = numWeeks * (cellSize + cellGap);
  const totalHeight = 7 * (cellSize + cellGap);

  // Skia touch handler
  // const touchHandler = useTouchHandler({
  //   onStart: (touch) => {
  //     const { x, y } = touch;
  //     const col = Math.floor(x / (cellSize + cellGap));
  //     const row = Math.floor(y / (cellSize + cellGap));
  //     const index = col * 7 + row;
  //     if (index >= 0 && index < daysInRange.length) {
  //       const day = daysInRange[index];
  //       setSelectedDay(day);
  //       setPopupPos({ x, y });
  //     } else {
  //       setSelectedDay(null);
  //       setPopupPos(null);
  //     }
  //   },
  // });

  // const touchValue = useValue({ x: 0, y: 0 });

  return (
    <View>
      <Canvas
        style={{ width: totalWidth, height: totalHeight }}
        // onTouch={touchHandler}
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
            styles.popupContainer,
            {
              left: popupPos.x + cellSize / 2,
              top: popupPos.y + cellSize / 2,
            },
          ]}
        >
          {renderPopup(selectedDay)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default HeatMap;
