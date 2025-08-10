// BarChart.tsx
import React, { Fragment, useMemo, useState } from 'react';
import {
  type GestureResponderEvent,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Canvas, Rect, Text, vec, Line } from '@shopify/react-native-skia';
import { arrayFrom, getFormattedString, isDefined } from '../util/util';
import { font, type CommonStyles } from './common';
import type { TooltipData } from './Tooltip';
import ToolTip from './Tooltip';

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
  const { maxValueCalculated } = useMemo(() => {
    if (isDefined(maxValue)) {
      return {
        maxValueCalculated: maxValue,
      };
    }

    if (data.length === 0) {
      return { maxValueCalculated: 100 };
    }
    let maxValueCalculated = Number.MIN_VALUE;

    data.forEach((item) => {
      const currentValue = item.values.reduce(
        (acc, value) => acc + value.value,
        0
      );
      maxValueCalculated = Math.max(maxValueCalculated, currentValue);
    });

    return { maxValueCalculated };
  }, [data, maxValue]);

  const { width: windowWidth } = useWindowDimensions();
  const [tooltip, setTooltip] = useState<TooltipData | undefined>(undefined);

  const minValueCalculated = minValue ?? 0;
  const steps = useMemo(() => arrayFrom(1, 0.2), []);

  const paddingRight = style?.paddingRight ?? style?.padding ?? 10;
  const paddingLeft = style?.paddingLeft ?? style?.padding ?? 10;
  const chartBarWidth = style?.barWidth ?? 100;
  const chartBarSpacing = style?.spacing ?? 20;
  const ySpace = 40;

  const chartWidth = useMemo(() => {
    if (isDefined(style?.width)) return style.width;

    return (
      chartBarSpacing * data.length +
      data.length * chartBarWidth +
      ySpace +
      paddingRight +
      paddingLeft
    );
  }, [style?.width, windowWidth]);

  const onCanvasTouchStart = (event: GestureResponderEvent) => {
    let leftExtraXSpace = paddingLeft + ySpace + strokeWidth;
    let xIndex = event.nativeEvent.locationX - leftExtraXSpace;
    xIndex = Math.floor(xIndex / (chartBarWidth + chartBarSpacing));
    let startingXIndex =
      xIndex * (chartBarWidth + chartBarSpacing) + leftExtraXSpace;

    if (startingXIndex + chartBarWidth < event.nativeEvent.locationX) {
      console.log('Touch is outside the bar width, ignoring.');
      setTooltip(undefined);
      return;
    }

    let yIndex = 0;
    let yPassed = 0;
    let categoryData = data[xIndex]?.values || [];
    let lastBarHeight = 0;

    while (
      yIndex < categoryData.length &&
      yPassed < chartHeight - event.nativeEvent.locationY + paddingTop
    ) {
      const barHeight =
        ((categoryData[yIndex]!.value - minValueCalculated) /
          (maxValueCalculated - minValueCalculated)) *
        chartHeight;
      yPassed += barHeight;
      lastBarHeight = barHeight;
      yIndex++;
    }

    if (yIndex === 0) {
      setTooltip(undefined);
      return;
    }
    console.log('Last bar height:', lastBarHeight, 'Y passed:', yPassed);

    setTooltip({
      centerX: startingXIndex + chartBarWidth / 2,
      centerY:
        chartHeight - yPassed - paddingTop + strokeWidth + lastBarHeight / 2,
      label: categoryData[yIndex - 1]!.label || ' :u ',
    });
  };

  const chartHeight = style?.height ?? 200;
  const paddingBottom = 30;
  const paddingTop = 10;
  const xSpace = paddingTop + 5;
  const strokeWidth = 2;

  return (
    <ScrollView horizontal onScroll={() => setTooltip(undefined)}>
      <Canvas
        style={{
          width: chartWidth,
          height: chartHeight + paddingBottom + paddingTop,
          backgroundColor: 'black',
        }}
        onTouchStart={onCanvasTouchStart}
      >
        {/* X axis */}
        <Line
          p1={vec(ySpace + paddingLeft, chartHeight + paddingTop)}
          p2={vec(chartWidth - paddingRight, chartHeight + paddingTop)}
          color="white"
          strokeWidth={strokeWidth}
        />
        <Line
          p1={vec(ySpace + paddingLeft, paddingTop)}
          p2={vec(ySpace + paddingLeft, chartHeight + paddingTop)}
          color="white"
          strokeWidth={strokeWidth}
        />

        {/* Bars */}
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
        {data.map((bar, xIndex) => {
          let previousHeight = 0;
          const x =
            xIndex * (chartBarWidth + chartBarSpacing) +
            ySpace +
            strokeWidth +
            paddingLeft;
          return (
            <Fragment key={xIndex}>
              <Text
                x={x}
                y={chartHeight + paddingTop + 20}
                text={bar.label}
                color="white"
                font={font}
              />
              {bar.values.map((item, yIndex) => {
                const barHeight =
                  ((item.value - minValueCalculated) /
                    (maxValueCalculated - minValueCalculated)) *
                  chartHeight;

                const y =
                  chartHeight -
                  barHeight -
                  previousHeight +
                  paddingTop -
                  strokeWidth;
                let color = colors?.[item.id ?? item.label] || '#4A90E2';

                previousHeight += barHeight;
                return (
                  <Rect
                    key={xIndex + '-' + yIndex}
                    x={x}
                    y={y}
                    width={chartBarWidth}
                    height={barHeight}
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
  );
}

export default BarChart;
