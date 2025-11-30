import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, StyleSheet, type GestureResponderEvent } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { GestureTouchEvent } from 'react-native-gesture-handler';

export type DayData = {
  date: string; // "YYYY-MM-DD"
  value: number;
  dayOfWeek: number;
  week: number;
  x: number;
  y: number;
};

export type HeatMapProps = {
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

function HeatMap(props: HeatMapProps) {
  const {
    daysInRange,
    totalWidth,
    totalHeight,
    popupData,
    popupRef,
    popupDimension,
    touchHandler,
    getColor,
    cellSize,
  } = useHeatMap(props);

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

      {popupData && props.renderPopup && (
        <View
          style={[
            {
              position: 'absolute',
              left: Math.max(
                0,
                Math.min(popupData.x, totalWidth - popupDimension.width)
              ),
              top: Math.max(
                0,
                Math.min(popupData.y, totalHeight - popupDimension.height)
              ),
            },
          ]}
          ref={popupRef}
        >
          {props.renderPopup(popupData.day)}
        </View>
      )}
    </View>
  );
}

export default HeatMap;
