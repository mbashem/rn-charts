import React, { type Ref } from 'react';
import { View } from 'react-native';
import { Canvas, Group, Rect, rect, type SkHostRect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { CommonStyle, HandleOutSideTouch } from '../common';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";

export type DayData = {
  date: string;
  value: number;
  dayOfWeek: number;
  week: number;
  x: number;
  y: number;
};

export interface HeatMapStyle extends CommonStyle, VerticalLabelStyle {
  cellSize?: number;
  cellGap?: number;
  cellMaxColor?: string;
  cellMinColor?: string;
  horizontalLabelPosition?: "top" | "bottom";
}

export interface HeatMapProps {
  startDate: string;
  endDate: string;
  data?: Record<string, number>;
  style?: HeatMapStyle;
  minValue?: number;
  maxValue?: number;
  xLabelSkiaView?: (
    label: string,
    position: { x: number; y: number; }
  ) => React.JSX.Element | undefined;
  yLabelSkiaView?: (
    index: number,
    yPosition: number
  ) => React.JSX.Element | undefined;

  xLabelView?: (
    label: string
  ) => React.JSX.Element | undefined;
  yLabelView?: (
    index: number
  ) => React.JSX.Element | undefined;

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

function HeatMap({ yLabelView, yLabelSkiaView, xLabelView, xLabelSkiaView, daySkiaView, onSelectView, onSelectSkiaView, ...props }: HeatMapProps) {
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
    horizontalLabelHeight,
    verticalLabelWidth,
    setHorizontalLabelHeight,
    setVerticalLabelWidth,
    numberOfRows,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight
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

  return <View
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
    <View style={{ flexDirection: "row" }}>
      {
        (yLabelView || yLabelSkiaView) && (<VerticalLabelView
          onLayout={(event) => {
            setVerticalLabelWidth(event.nativeEvent.layout.width);
          }}
          labelPercentages={Array.from({ length: numberOfRows }, (_, i) => (i + 1) / numberOfRows)}
          styles={{
            width: props.style?.yLabelWidth,
            height: totalHeight,
            strokeWidth: props.style?.yLabelStrokeWidth,
            strokeColor: props.style?.yLabelStrokeColor,
            backgroundColor: props.style?.yLabelBackgroundColor
          }}
          labelSkiaView={(_percentage, yPosition, index) => yLabelSkiaView?.(index, yPosition)}
        >
          {(_percentage, index) => yLabelView?.(index)}
        </VerticalLabelView>)
      }
      <View style={{ width: totalWidth, height: totalHeight }}>
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
      </View>
    </View>

    {
      popupData && (<>
        {onSelectViewMemo &&
          <View
            style={{
              position: "absolute",
              top: popupData.y + (props.style?.horizontalLabelPosition === "bottom" ? 0 : horizontalLabelHeight),
              left: popupData.x + verticalLabelWidth
            }}
          >
            {onSelectViewMemo}
          </View>
        }
        <Popup
          popupData={{ x: popupData.x, y: popupData.y, data: popupData.day }}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          touchHandler={(x, y) => {
            touchHandler(x - verticalLabelWidth - paddingLeft, y - (props.style?.horizontalLabelPosition === "bottom" ? 0 : horizontalLabelHeight));
          }}
          onTouchOutside={onTouchOutside}
          popupStyle={props.popupStyle}
          viewOffset={viewOffset}
        />
      </>
      )
    }
  </View >;
}

export default HeatMap;
