import React, { type Ref } from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { CommonStyle } from '../common';

export type DayData = {
  date: string;
  value: number;
  dayOfWeek: number;
  week: number;
  x: number;
  y: number;
};

export interface HandleOutSideTouch {
  touchedOutside: () => void;
}

export interface HeatMapStyle extends CommonStyle {
  cellSize?: number;
  cellGap?: number;
  cellMaxColor?: string;
  cellMinColor?: string;
}

export interface HeatMapProps {
  startDate: string;
  endDate: string;
  data?: Record<string, number>;
  style?: HeatMapStyle;
  minValue?: number;
  maxValue?: number;
  ref?: Ref<HandleOutSideTouch | undefined>;
  renderPopup?: (day: DayData) => React.ReactNode;
}

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
    <View style={{ backgroundColor: props.style?.backgroundColor }}>
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
        <>
          <Pressable
            onPress={touchHandler}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
            }}
          />
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
        </>
      )}
    </View>
  );
}

export default HeatMap;
