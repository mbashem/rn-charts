import { Fragment } from 'react';
import { ScrollView, View } from 'react-native';

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
  label: string;
}

export interface BarChartStyle extends CommonStyle {
  width?: number;
  height?: number;
  barWidth?: number;
  barSpacing?: number;
  fontSize?: number;
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
    paddingRight,
    paddingLeft,
    paddingBottom,
    paddingTop,
    rectangles,
    verticalLabelWidth,
    chartHeight,
    chartWidth,
    strokeWidth,
    tooltip,
    bottomLabelHeight,
    fontSize,
    font,
    setTooltip,
    onCanvasTouchStart,
  } = useBarChart(data, style, maxValue, minValue);

  return (
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
      <ScrollView
        bounces={false}
        overScrollMode="never"
        horizontal
        onScroll={(event) => setTooltip(undefined)}
      >
        <Canvas
          style={{
            width: chartWidth,
            height: canvasHeight,
            paddingRight: 50
          }}
          onTouchStart={onCanvasTouchStart}
        >
          {/* X axis */}
          <Line
            p1={vec(0, chartHeight)}
            p2={vec(chartWidth, chartHeight)}
            color="white"
            strokeWidth={strokeWidth}
          />

          {/* Bars */}

          {rectangles.map((bar, xIndex) => {
            if (bar.length === 0) return null;
            return (
              <Fragment key={xIndex}>
                <Text
                  x={bar[0]!.x}
                  y={
                    chartHeight + fontSize + (bottomLabelHeight - fontSize) / 2
                  }
                  text={data[xIndex]!.label}
                  color="white"
                  font={font}
                />
                {bar.map((item, yIndex) => {
                  let currentData = data[xIndex]!.values[yIndex]!;
                  let color =
                    colors?.[currentData.id ?? currentData.label] || '#4A90E2';
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
      </ScrollView>
    </View>
  );
}

export default BarChart;
