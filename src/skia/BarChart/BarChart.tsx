import { Fragment } from 'react';
import { ScrollView } from 'react-native';

import { Canvas, Rect, Text, vec, Line } from '@shopify/react-native-skia';
import { getFormattedString } from '../../util/util';
import { font, type CommonStyles } from '../common';
import ToolTip from '../Tooltip';
import useBarChart from './useBarChart';

export interface StackValue {
  value: number;
  label: string;
  id?: string;
}

export interface BarData {
  values: StackValue[];
  label: string;
}

export interface BarChartStyle extends CommonStyles {
  width?: number;
  height?: number;
  barWidth?: number;
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
    steps,
    paddingRight,
    paddingLeft,
    paddingBottom,
    paddingTop,
    rectangles,
    verticalLabelSpace,
    chartHeight,
    chartWidth,
    strokeWidth,
    tooltip,
    setTooltip,
    onCanvasTouchStart,
  } = useBarChart(data, style, maxValue, minValue);

  const xSpace = paddingTop + 5;

  return (
    <>
      <Canvas
        style={{
          width: verticalLabelSpace,
          backgroundColor: style?.backgroundColor,
        }}
      >
        {steps.map((value, index) => (
          <Text
            key={index}
            x={paddingLeft}
            y={chartHeight - value * chartHeight + xSpace}
            text={getFormattedString(value * maxValueCalculated).toString()}
            color="white"
            font={font}
          />
        ))}
        <Line
          p1={vec(verticalLabelSpace, paddingTop)}
          p2={vec(verticalLabelSpace, chartHeight + paddingTop)}
          color="white"
          strokeWidth={strokeWidth}
        />
      </Canvas>
      <ScrollView
        bounces={false}
        overScrollMode="never"
        horizontal
        onScroll={() => setTooltip(undefined)}
      >
        <Canvas
          style={{
            width: chartWidth,
            height: chartHeight + paddingBottom + paddingTop,
            backgroundColor: style?.backgroundColor,
          }}
          onTouchStart={onCanvasTouchStart}
        >
          {/* X axis */}
          <Line
            p1={vec(0, chartHeight + paddingTop)}
            p2={vec(chartWidth - paddingRight, chartHeight + paddingTop)}
            color="white"
            strokeWidth={strokeWidth}
          />
          <Line
            p1={vec(0, paddingTop)}
            p2={vec(0, chartHeight + paddingTop)}
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
                  y={chartHeight + paddingTop + 20}
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
    </>
  );
}

export default BarChart;
