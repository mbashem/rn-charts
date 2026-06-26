import React, { type Ref } from 'react';
import { View } from 'react-native';
import { Canvas, Group, Rect, rect, type SkHostRect } from '@shopify/react-native-skia';
import useHeatMap from './useHeatMap';
import type { CommonStyle, HandleOutSideTouch } from '../common';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";
import HorizontalLabelView, { type HorizontalLabelStyleExtended } from "../Common/HorizontalLabelView";

export type CellDatum = {
  rowIndex: number;
  colIndex: number;
  groupIndex: number;
  value: number;
  x: number;
  y: number;
};

export interface HeatMapDataGroup {
  cols: number;
  startingRow: number;
  endingRow: number;
  data?: Record<number, Record<number, number>>;
}

export interface HeatMapStyle extends CommonStyle {
  cellSize?: number;
  cellGap?: number;
  cellMaxColor?: string;
  cellMinColor?: string;
  horizontalLabelStyle?: HorizontalLabelStyleExtended;
  verticalLabelStyle?: VerticalLabelStyle;
  interGroupSpacing?: number;
}

export interface HeatMapProps {
  rows: number;
  data: HeatMapDataGroup[];
  coalesceGroups?: boolean;
  style?: HeatMapStyle;
  minValue?: number;
  maxValue?: number;
  xLabelSkiaView?: (
    index: number,
    rect: SkHostRect,
  ) => React.JSX.Element | undefined;
  yLabelSkiaView?: (
    index: number,
    yPosition: number
  ) => React.JSX.Element | undefined;

  xLabelView?: (
    index: number,
    width: number
  ) => React.JSX.Element | undefined;
  yLabelView?: (
    index: number
  ) => React.JSX.Element | undefined;

  cellSkiaView?: (
    rect: SkHostRect,
    day: CellDatum
  ) => React.JSX.Element | undefined;

  onSelectSkiaView?: (
    rect: SkHostRect,
    day: CellDatum
  ) => React.JSX.Element | undefined;
  onSelectView?: (
    rect: SkHostRect,
    day: CellDatum
  ) => React.JSX.Element | undefined;
  ref?: Ref<HandleOutSideTouch | undefined>;
  popupStyle?: PopupStyle<CellDatum>;
}

function HeatMap({ yLabelView, yLabelSkiaView, xLabelView, xLabelSkiaView, cellSkiaView, onSelectView, onSelectSkiaView, ...props }: HeatMapProps) {
  const {
    cellData,
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
    paddingRight,
    xLabelsRect
  } = useHeatMap(props);

  const [viewOffset, setViewOffset] = React.useState({ x: 0, y: 0 });
  const onSelectSkiaViewMemo = React.useMemo(() => {
    if (!popupData || !onSelectSkiaView) {
      return undefined;
    }
    return onSelectSkiaView?.(rect(popupData.x, popupData.y, cellSize, cellSize), popupData.data);
  }, [popupData, onSelectSkiaView, cellSize]);

  const onSelectViewMemo = React.useMemo(() => {
    if (!popupData || !onSelectView) {
      return undefined;
    }
    return onSelectView(rect(popupData.x, popupData.y, cellSize, cellSize), popupData.data);
  }, [popupData, onSelectView, cellSize]);

  return <View
    style={{ backgroundColor: props.style?.backgroundColor, paddingLeft, paddingRight, paddingTop, paddingBottom }}
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
            height: totalHeight,
            top: horizontalLabelHeight,
            verticalLabelStyle: props.style?.verticalLabelStyle,
          }}
          labelSkiaView={(_percentage, yPosition, index) => yLabelSkiaView?.(index, yPosition)}
        >
          {(_percentage, index) => yLabelView?.(index)}
        </VerticalLabelView>)
      }
      <View style={{ width: totalWidth, height: totalHeight }}>
        {
          (xLabelView || xLabelSkiaView) &&
          <HorizontalLabelView
            labels={xLabelsRect.map((rect) => rect)}
            positions={xLabelsRect.map(rect => rect.x)}
            style={{
              width: totalWidth,
              horizontalLabelStyle: props.style?.horizontalLabelStyle,
            }}
            onLayout={(event) => setHorizontalLabelHeight(event.nativeEvent.layout.height)}
            labelSkiaView={(yPostion, index, data) => xLabelSkiaView?.(index, data)}
          >
            {(index, rect) => xLabelView?.(index, rect.width)}
          </HorizontalLabelView>
        }
        <Canvas
          style={{ width: totalWidth, height: totalHeight }}
          onTouchStart={(event) =>
            touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
          }
        >
          <Group>
            {cellData.map((datum) => {
              let skiaView = cellSkiaView?.(rect(datum.x, datum.y, cellSize, cellSize), datum);
              if (skiaView !== undefined) { return skiaView; }
              return (
                <Rect
                  key={datum.x + '-' + datum.y}
                  x={datum.x}
                  y={datum.y}
                  width={cellSize}
                  height={cellSize}
                  color={getColor(datum.value)}
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
              top: popupData.y + (props.style?.horizontalLabelStyle?.viewPosition === "bottom" ? 0 : horizontalLabelHeight) + paddingTop,
              left: popupData.x + verticalLabelWidth + paddingLeft
            }}
          >
            {onSelectViewMemo}
          </View>
        }
        <Popup
          popupData={{ x: popupData.x + verticalLabelWidth + paddingLeft, y: popupData.y + (props.style?.horizontalLabelStyle?.viewPosition === "bottom" ? 0 : horizontalLabelHeight) + paddingTop, data: popupData.data }}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
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
