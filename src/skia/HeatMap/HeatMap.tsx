import React, { type Ref } from 'react';
import { View, Modal } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { CommonStyle } from '../common';
import Popup, { type PopupStyle } from '../Popup';

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
  popupStyle?: PopupStyle<DayData>;
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
    onTouchOutside,
  } = useHeatMap(props);

  const [viewOffset, setViewOffset] = React.useState({ x: 0, y: 0 });

  return (
    <View
      style={{ backgroundColor: props.style?.backgroundColor }}
      ref={(view) => {
        view?.measureInWindow((fx, fy) => {
          setViewOffset((prev) => {
            if (prev.x === fx && prev.y === fy) {
              return prev;
            }
            return { x: fx, y: fy };
          });
        });
      }}
    >
      <Canvas
        style={{ width: totalWidth, height: totalHeight }}
        onTouchStart={(event) =>
          touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
        }
      >
        <Group>
          {daysInRange.map((day) => {
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

      {popupData && props.popupStyle && (
        <Popup
          popupData={{ x: popupData.x, y: popupData.y, data: popupData.day }}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          touchHandler={touchHandler}
          onTouchOutside={onTouchOutside}
          popupStyle={props.popupStyle}
          viewOffset={viewOffset}
        />
      )}
    </View>
  );
}

export default HeatMap;
