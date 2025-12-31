import { Fragment, useState } from 'react';
import { View } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Canvas, Rect, Text, vec, Line } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import useBarChart from './useBarChart';
import VerticalLabel from '../Common/VerticalLabel';
import Popup, { type PopupStyle } from '../Popup';

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
}

export interface BarChartProps {
  data: BarData[];
  colors?: Record<string, string>;
  maxValue?: number;
  minValue?: number;
  popStyle?: PopupStyle<StackValue>;
  style?: BarChartStyle;
}

function BarChart({ data, colors, maxValue, minValue, style, popStyle }: BarChartProps) {
  const {
    maxValueCalculated,
    minValueCalculated,
    canvasHeight,
    canvasWidth,
    paddingRight,
    paddingLeft,
    paddingBottom,
    paddingTop,
    rectangles,
    verticalLabelWidth,
    chartHeight,
    strokeWidth,
    tooltip,
    bottomLabelHeight,
    font,
    onScroll,
    touchHandler,
    totalHeight,
    totalWidth,
  } = useBarChart(data, style, maxValue, minValue);

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      onScroll(-e.translationX);
    });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  return (
    <GestureHandlerRootView>
      <View
        style={{
          width: totalWidth,
          flexDirection: 'row',
          backgroundColor: style?.backgroundColor,
          paddingLeft: paddingLeft,
          paddingRight: paddingRight,
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
        <VerticalLabel
          maxValue={maxValueCalculated}
          minValue={minValueCalculated}
          labelCount={6}
          styles={{
            width: verticalLabelWidth,
            height: chartHeight,
            strokeWidth,
          }}
        />
        <GestureDetector gesture={dragGesture}>
          <Canvas
            style={{
              width: canvasWidth,
              height: canvasHeight,
              paddingRight: 50,
              backgroundColor: 'red',
            }}
            onTouchStart={(event) =>
              touchHandler(
                event.nativeEvent.locationX,
                event.nativeEvent.locationY
              )
            }
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
                  <Text
                    x={bar.bars[0]!.x}
                    y={
                      chartHeight +
                      font.getSize() +
                      (bottomLabelHeight - font.getSize()) / 2
                    }
                    text={bar.label ?? ''}
                    color="white"
                    font={font}
                  />
                  {bar.bars.map((item, yIndex) => {
                    let currentData = data[xIndex]!.values[yIndex]!;
                    let color =
                      colors?.[currentData.id ?? currentData.label] ||
                      '#4A90E2';
                    return (
                      <Rect
                        key={xIndex + '-' + yIndex}
                        x={item.x}
                        y={item.y}
                        width={item.width}
                        height={item.height}
                        color={color}
                      />
                    );
                  })}
                </Fragment>
              );
            })}
          </Canvas>
        </GestureDetector>
        {tooltip && (
          <Popup
            popupData={{
              x: tooltip.centerX,
              y: tooltip.centerY,
              data: tooltip.data,
            }}
            popupStyle={popStyle}
            totalWidth={totalWidth}
            totalHeight={totalHeight}
            touchHandler={(x, y) => touchHandler(x - verticalLabelWidth - paddingLeft, y - paddingTop)}
            viewOffset={viewOffset}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

export default BarChart;
