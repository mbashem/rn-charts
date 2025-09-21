import { Fragment } from 'react';
import { ScrollView, View } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Canvas, Rect, Text, vec, Line } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import ToolTip from '../Tooltip';
import useBarChart from './useBarChart';
import VerticalLabel from '../Common/VerticalLabel';

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
  style?: BarChartStyle;
}

function BarChart({ data, colors, maxValue, minValue, style }: BarChartProps) {
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
    scrollAreaWidth,
    strokeWidth,
    tooltip,
    bottomLabelHeight,
    font,
    onScroll,
    onCanvasTouchStart,
  } = useBarChart(data, style, maxValue, minValue);

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      onScroll(-e.translationX);
    })

  return (
    <GestureHandlerRootView>
      <View
        style={{
          width: style?.width,
          flexDirection: 'row',
          backgroundColor: style?.backgroundColor,
          paddingLeft: paddingLeft,
          paddingRight: paddingRight,
          paddingTop: paddingTop,
          paddingBottom: paddingBottom,
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
        {/* <ScrollView
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ width: scrollAreaWidth }}
        horizontal
        onScroll={onScroll}
      > */}
        <GestureDetector gesture={dragGesture}>
          <Canvas
            style={{
              width: canvasWidth,
              height: canvasHeight,
              paddingRight: 50,
              backgroundColor: 'red',
            }}
            onTouchStart={onCanvasTouchStart}
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
                    if (xIndex === rectangles.length - 1) color = 'pink';
                    else if (xIndex === 0) color = 'lightgreen';
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
            <ToolTip data={tooltip} />
          </Canvas>
        </GestureDetector>
        {/* </ScrollView> */}
      </View>
    </GestureHandlerRootView>
  );
}

export default BarChart;
