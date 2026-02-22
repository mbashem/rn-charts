import React, { Fragment, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { Canvas, Rect, vec, Line, type SkHostRect, LinearGradient } from '@shopify/react-native-skia';

import { type CommonStyle } from '../common';
import useBarChart from './useBarChart';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";
import HorizontalLabelView from "../Common/HorizontalLabelView";

export interface StackValue {
  value: number;
  label: string;
  id?: string;
}

export interface BarData {
  values: StackValue[];
  label?: string;
}

export interface BarChartStyle extends CommonStyle, VerticalLabelStyle {
  width?: number;
  height?: number;
  barWidth?: number;
  barSpacing?: number;
  firstBarLeadingSpacing?: number;
  lastBarTrailingSpacing?: number;
  strokeWidth?: number;
}

export interface BarChartProps {
  data: BarData[];
  colors?: Record<string, string | string[]>;
  yLabels: number[];
  yLabelView?: (percentage: number, min: number, max: number) => JSX.Element;
  yLabelSkiaView?: (percentage: number, yPosition: number) => JSX.Element | undefined;
  xLabelView?: (label?: string) => JSX.Element;
  onSelectBarView?: (stackValue: StackValue, xLabel?: string) => React.JSX.Element | undefined;
  barSkiaView?: (rect: SkHostRect, stackValue: StackValue, xLabel?: string) => React.JSX.Element | undefined;
  onSelectBarSkiaView?: (rect: SkHostRect, stackValue: StackValue, xLabel?: string) => React.JSX.Element | undefined;
  maxValue?: number;
  minValue?: number;
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
    strokeWidth,
    tooltip,
    setBottomLabelHeight,
    onScroll,
    touchHandler,
    totalHeight,
    totalWidth,
  } = useBarChart(props);

  const panGestureRef = useRef(Gesture.Pan());
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onChange((event) => {
      onScroll(-event.changeX);
    })
    .withRef(panGestureRef);
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart((event) => {
      touchHandler(event.x, event.y);
    });

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
                width: props.style?.yLabelWidth,
                height: chartHeight,
                strokeWidth,
                backgroundColor: props.style?.yLabelBackgroundColor
              }}
              labelSkiaView={(percentage, yPosition) => yLabelSkiaView?.(percentage, yPosition)}
            >
              {percentage => yLabelView?.(percentage, minValueCalculated, maxValueCalculated)}
            </VerticalLabelView>)
          }
          <ScrollView horizontal={true} simultaneousHandlers={panGestureRef} style={{ padding: 0 }}>
            <GestureDetector gesture={canvasGestures}>

              <Canvas
                style={{
                  width: canvasWidth,
                  height: chartHeight,
                }}
              >
                {/* X axis */}
                <Line
                  p1={vec(0, chartHeight)}
                  p2={vec(canvasWidth, chartHeight)}
                  color="white"
                  strokeWidth={strokeWidth}
                />

                {/* Bars */}

                {rectangles.map((bar, xIndex) => {
                  if (bar.bars.length === 0) return null;
                  return (
                    <Fragment key={xIndex}>
                      {bar.bars.map(({ rect, stackValue }, yIndex) => {
                        let skiaView = barSkiaView?.(rect, stackValue, bar.label);
                        if (skiaView !== undefined) { return skiaView; }
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
                    </Fragment>
                  );
                })}
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
            styles={{
              left: verticalLabelWidth,
              width: canvasWidth,
            }}
            onLayout={(event) => setBottomLabelHeight(event.nativeEvent.layout.height)}
          >
            {label => xLabelView(label)}
          </HorizontalLabelView>
        }
        {tooltip && (
          <>
            {onSelectBarViewMemo &&
              <View
                style={{
                  position: "absolute",
                  top: tooltip.rect.y + paddingTop,
                  left: verticalLabelWidth + paddingLeft + tooltip.rect.x,
                  width: tooltip.rect.width,
                  height: tooltip.rect.height,
                }}
              >
                {onSelectBarViewMemo}
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
              touchHandler={(x, y) => {
                touchHandler(x - verticalLabelWidth - paddingLeft, y);
              }}
              viewOffset={viewOffset}
            />
          </>
        )}
      </View>
    </GestureHandlerRootView >
  );
}

export default BarChart;
