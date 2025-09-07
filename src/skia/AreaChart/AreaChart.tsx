// AreaChart.tsx
import { useMemo } from 'react';
import {
  Canvas,
  Path,
  Skia,
  Text,
  type SkPath,
} from '@shopify/react-native-skia';
import { getPaddings, type CommonStyle } from '../common';
import VerticalLabel from '../Common/VerticalLabel';
import { View } from 'react-native';
import useAreaChart, { type AreaData } from './useAreaChart';

export interface AreaChartStyle extends CommonStyle {
  width: number;
  height: number;
  fontSize?: number;
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
      >
        {paths.map(({ path, color }, index) => {
          return <Path key={index} path={path} color={color} />;
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
      </Canvas>
    </View>
  );
}

export default AreaChart;
