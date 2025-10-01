// AreaChart.tsx
import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  Text,
  type SkPath,
} from '@shopify/react-native-skia';
import { getPaddings, type CommonStyle } from '../common';
import VerticalLabel from '../Common/VerticalLabel';
import { View, type GestureResponderEvent } from 'react-native';
import useAreaChart, { type AreaData } from './useAreaChart';
import { useState } from 'react';
import { lighten } from '../../util/colors';

export interface AreaChartStyle extends CommonStyle {
  width: number;
  height: number;
  showPoints?: boolean;
  pointRadius?: number;
  lightenPointsBy?: number;
}

interface AreaChartProps {
  data: AreaData[];
  minValue?: number;
  maxValue?: number;
  xLabels?: string[];
  style?: AreaChartStyle;
}

function AreaChart({
  data,
  xLabels,
  minValue: minValueProp,
  maxValue: maxValueProp,
  style,
}: AreaChartProps) {
  const {
    minValue,
    maxValue,
    canvasHeight,
    areaCanvasHeight,
    labelWidth,
    chartWidth,
    paths,
    xLabelsData,
    xLabelHeight,
    font,
    touchLine,
    onCanvasTouchStart,
  } = useAreaChart(data, xLabels, maxValueProp, minValueProp, style);

  return (
    <View style={[style, { flexDirection: 'row' }]}>
      <VerticalLabel
        minValue={minValue}
        maxValue={maxValue}
        styles={{
          height: areaCanvasHeight,
          width: labelWidth,
          fontSize: style?.fontSize,
        }}
        labelCount={5}
      />

      <Canvas
        style={{
          width: chartWidth,
          height: canvasHeight,
        }}
        onTouchStart={onCanvasTouchStart}
      >
        {paths.map(({ path, points, color }, index) => {
          return (
            <Group key={index}>
              <Path path={path} color={color} />
              {style?.showPoints &&
                color &&
                points.map((points) => (
                  <Circle
                    key={`${points.x}-${points.y}`}
                    cx={points.x}
                    cy={points.y}
                    r={style?.pointRadius ?? 3}
                    color={lighten(color, style?.lightenPointsBy ?? 0.3)}
                  />
                ))}
            </Group>
          );
        })}
        {xLabelsData.map(({ label, xPosition }, index) => {
          return (
            <Text
              key={index}
              x={xPosition}
              y={canvasHeight}
              text={label}
              font={font}
              color={'white'}
            />
          );
        })}
        {/* {touchLine && (

        )} */}
      </Canvas>
    </View>
  );
}

export default AreaChart;
