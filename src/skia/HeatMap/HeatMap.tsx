import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Group,
  Rect
} from "@shopify/react-native-skia";

type DayData = {
  date: string; // "YYYY-MM-DD"
  value: number;
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
  renderPopup: (day: DayData) => React.ReactNode;
};

export const HeatMap: React.FC<HeatMapProps> = ({
  startDate,
  endDate,
  data,
  cellSize = 24,
  cellGap = 4,
  color = "#4CAF50",
  minValue,
  maxValue,
  renderPopup,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Helper to format dates
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  // Generate all days between startDate and endDate (inclusive)
  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDays: DayData[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      const found = data.find((x) => x.date === dateStr);
      allDays.push({ date: dateStr, value: found ? found.value : 0 });
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
    if (value <= 0) return "#e0e0e0";
    const intensity = Math.min(
      1,
      Math.max(0, (value - computedMin) / (computedMax - computedMin || 1))
    );

    const bigint = parseInt(color.replace("#", ""), 16);
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
            const week = Math.floor(i / 7);
            const dayOfWeek = i % 7;
            const x = week * (cellSize + cellGap);
            const y = dayOfWeek * (cellSize + cellGap);

            return (
              <Rect
                key={day.date}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                color={getColor(day.value)}
              />
            );
          })}
        </Group>
      </Canvas>

      {selectedDay && popupPos && (
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
};

const styles = StyleSheet.create({
  popupContainer: {
    position: "absolute",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
