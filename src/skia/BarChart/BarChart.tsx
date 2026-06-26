import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { Canvas, Rect, vec, type SkHostRect, LinearGradient, Group, rect as SKRect, type Transforms3d } from '@shopify/react-native-skia';

import { type CommonStyle } from '../common';
import useBarChart from './useBarChart';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";
import HorizontalLabelView, { type HorizontalLabelStyle } from "../Common/HorizontalLabelView";
import { useDerivedValue } from "react-native-reanimated";

export interface StackValue {
  value: number;
  label: string;
  id?: string;
}

export interface BarData {
  values: StackValue[];
  label?: string;
}

export interface BarChartStyle extends CommonStyle {
  width?: number;
  height?: number;
  barWidth?: number;
  barSpacing?: number;
  firstBarLeadingSpacing?: number;
  lastBarTrailingSpacing?: number;
  verticalLabelStyle?: VerticalLabelStyle;
  horizontalLabelStyle?: HorizontalLabelStyle;
}

export interface BarChartProps {
  data: BarData[];
  colors?: Record<string, string | string[]>;
  yLabels: number[];
  yLabelView?: (percentage: number, min: number, max: number) => React.JSX.Element;
  yLabelSkiaView?: (percentage: number, yPosition: number) => React.JSX.Element | undefined;
  xLabelView?: (label?: string) => React.JSX.Element;
  onSelectBarView?: (stackValue: StackValue, xLabel?: string) => React.JSX.Element | undefined;
  barSkiaView?: (rect: SkHostRect, stackValue: StackValue, xLabel?: string) => React.JSX.Element | undefined;
  onSelectBarSkiaView?: (rect: SkHostRect, stackValue: StackValue, xLabel?: string) => React.JSX.Element | undefined;
  maxValue?: number;
  minValue?: number;
  overscanRatio?: number;
  popupStyle?: PopupStyle<StackValue>;
  style?: BarChartStyle;
}

function BarChart({ xLabelView, yLabelView, yLabelSkiaView, barSkiaView, onSelectBarSkiaView, onSelectBarView, ...props }: BarChartProps) {
  const {
    maxValueCalculated,
    minValueCalculated,
    yLabels,
    canvasWidth,
    paddingRight,
    paddingLeft,
    paddingBottom,
    paddingTop,
    rectangles,
    verticalLabelWidth,
    setVerticalLabelWidth,
    chartHeight,
    tooltip,
    setTooltip,
    setBottomLabelHeight,
    onScroll,
    touchHandler,
    totalHeight,
    totalWidth,
    horizontalStrokeWidth,
    offset
  } = useBarChart(props);

  const panGestureRef = useRef(Gesture.Pan());
  const lastChartTouchStartAt = useRef(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      onScroll(-event.changeX);
    })
    .withRef(panGestureRef);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart((event) => {
      touchHandler(event.x, event.y);
    });

  const markChartTouchStart = () => {
    lastChartTouchStartAt.current = Date.now();
  };

  const handlePopupTouchOutside = () => {
    const outsideTouchAt = Date.now();

    setTimeout(() => {
      if (lastChartTouchStartAt.current < outsideTouchAt - 120) {
        setTooltip(undefined);
      }
    }, 120);
  };

  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const canvasGestures = Gesture.Exclusive(panGesture, tapGesture);
  const onSelectBarViewMemo = useMemo(() => {
    if (tooltip === undefined) { return undefined; }
    return onSelectBarView?.(tooltip.data, tooltip.xLabel);
  }, [tooltip]);
  const onSelectBarSkiaViewMemo = useMemo(() => {
    if (tooltip === undefined) { return undefined; }
    return onSelectBarSkiaView?.(tooltip.rect, tooltip.data, tooltip.xLabel);
  }, [tooltip]);
  const canvasGroupTranslate = useDerivedValue<Transforms3d>(() => [{ translateX: -offset.value }], []);

  return (
    <GestureHandlerRootView>
      <View
        style={{
          width: totalWidth,
          flexDirection: 'column',
          backgroundColor: props.style?.backgroundColor,
          paddingStart: paddingLeft,
          paddingEnd: paddingRight,
          paddingTop: paddingTop,
          paddingBottom: paddingBottom,
        }}
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
        <View style={{ flexDirection: "row", height: chartHeight, padding: 0 }}>
          {
            (yLabelView || yLabelSkiaView) && (<VerticalLabelView
              onLayout={(event) => {
                setVerticalLabelWidth(event.nativeEvent.layout.width);
              }}
              labelPercentages={yLabels}
              styles={{
                height: chartHeight + horizontalStrokeWidth,
                verticalLabelStyle: props.style?.verticalLabelStyle,
              }}
              labelSkiaView={(percentage, yPosition) => yLabelSkiaView?.(percentage, yPosition)}
            >
              {percentage => yLabelView?.(percentage, minValueCalculated, maxValueCalculated)}
            </VerticalLabelView>)
          }
          <ScrollView
            horizontal={true}
            onTouchStart={markChartTouchStart}
            simultaneousHandlers={panGestureRef}
            style={{ padding: 0 }}
          >
            <GestureDetector gesture={canvasGestures}>
              <Canvas
                style={{
                  width: canvasWidth,
                  height: chartHeight,
                }}
              >
                <Group transform={canvasGroupTranslate}>
                  {rectangles.map((bar, xIndex) => {
                    if (bar.bars.length === 0) return null;
                    return (
                      <Group key={xIndex}>
                        {bar.bars.map(({ rect, stackValue }, yIndex) => {
                          let skiaView = barSkiaView?.(SKRect(rect.x, rect.y, rect.width, rect.height), stackValue, bar.label);
                          if (skiaView !== undefined) { return <Group key={xIndex + "-" + yIndex}>{skiaView}</Group>; }
                          let currentData = props.data[xIndex]!.values[yIndex]!;
                          let color =
                            props?.colors?.[currentData.id ?? currentData.label];
                          return (
                            <Rect
                              key={xIndex + '-' + yIndex}
                              x={rect.x}
                              y={rect.y}
                              width={rect.width}
                              height={rect.height}
                              color={Array.isArray(color) ? undefined : color}
                            >
                              {Array.isArray(color) && (
                                <LinearGradient
                                  start={vec(rect.x, rect.y)}
                                  end={vec(rect.x + rect.width, rect.y + rect.height)}
                                  colors={color}
                                />
                              )}
                            </Rect>
                          );
                        })}
                      </Group>
                    );
                  })}
                </Group>
                {onSelectBarSkiaViewMemo}
              </Canvas>
            </GestureDetector>
          </ScrollView>
        </View>
        {
          xLabelView &&
          <HorizontalLabelView
            labels={rectangles.map(bar => bar.label)}
            positions={rectangles.map(bar => bar.x)}
            transform={canvasGroupTranslate}
            xOffset={offset}
            style={{
              left: verticalLabelWidth,
              width: canvasWidth,
              horizontalLabelStyle: props.style?.horizontalLabelStyle
            }}
            onLayout={(event) => setBottomLabelHeight(event.nativeEvent.layout.height)}
          >
            {(_index, data) => xLabelView(data)}
          </HorizontalLabelView>
        }
        {tooltip && (
          <>
            {onSelectBarViewMemo &&
              <View
                style={{
                  position: "absolute",
                  top: tooltip.rect.y + paddingTop,
                  left: verticalLabelWidth + paddingLeft + Math.max(0, tooltip.rect.x),
                  width: tooltip.rect.width,
                  height: tooltip.rect.height,
                  overflow: "hidden",
                }}>
                <View
                  style={{
                    position: "relative",
                    top: 0,
                    left: -Math.max(0, -tooltip.rect.x),
                    width: tooltip.rect.width,
                    height: tooltip.rect.height,
                  }}
                >
                  {onSelectBarViewMemo}
                </View>
              </View>
            }
            <Popup
              popupData={{
                x: tooltip.centerX,
                y: tooltip.centerY,
                data: tooltip.data,
              }}
              popupStyle={props.popupStyle}
              totalWidth={totalWidth}
              totalHeight={totalHeight}
              onTouchOutside={handlePopupTouchOutside}
              viewOffset={viewOffset}
            />
          </>
        )}
      </View>
    </GestureHandlerRootView >
  );
}

export default BarChart;
