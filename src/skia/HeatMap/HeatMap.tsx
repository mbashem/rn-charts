import React, { type Ref } from 'react';
import { View } from 'react-native';
import { Canvas, Group, Rect, rect, type SkHostRect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { CommonStyle, HandleOutSideTouch } from '../common';
import Popup, { type PopupStyle } from '../Popup';

export type DayData = {
  date: string;
  value: number;
  dayOfWeek: number;
  week: number;
  x: number;
  y: number;
};

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
  daySkiaView?: (
    rect: SkHostRect,
    day: DayData
  ) => React.JSX.Element | undefined;
  onSelectSkiaView?: (
    rect: SkHostRect,
    day: DayData
  ) => React.JSX.Element | undefined;
  onSelectView?: (
    rect: SkHostRect,
    day: DayData
  ) => React.JSX.Element | undefined;
  ref?: Ref<HandleOutSideTouch | undefined>;
  popupStyle?: PopupStyle<DayData>;
}

function HeatMap({ daySkiaView, onSelectView, onSelectSkiaView, ...props }: HeatMapProps) {
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
  const onSelectSkiaViewMemo = React.useMemo(() => {
    if (!popupData || !onSelectSkiaView) {
      return undefined;
    }
    return onSelectSkiaView?.(rect(popupData.x, popupData.y, cellSize, cellSize), popupData.day);
  }, [popupData, onSelectSkiaView, cellSize]);

  const onSelectViewMemo = React.useMemo(() => {
    if (!popupData || !onSelectView) {
      return undefined;
    }
    return onSelectView(rect(popupData.x, popupData.y, cellSize, cellSize), popupData.day);
  }, [popupData, onSelectView, cellSize]);

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
            let skiaView = daySkiaView?.(rect(day.x, day.y, cellSize, cellSize), day);
            if (skiaView !== undefined) { return skiaView; }

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
          {onSelectSkiaViewMemo}
        </Group>
      </Canvas>

      {popupData && props.popupStyle && (<>
        {onSelectViewMemo &&
          <View
            style={{
              position: "absolute",
              top: popupData.y,
              left: popupData.x
            }}
          >
            {onSelectViewMemo}
          </View>
        }
        <Popup
          popupData={{ x: popupData.x, y: popupData.y, data: popupData.day }}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          touchHandler={touchHandler}
          onTouchOutside={onTouchOutside}
          popupStyle={props.popupStyle}
          viewOffset={viewOffset}
        />
      </>
      )}
    </View>
  );
}

export default HeatMap;
