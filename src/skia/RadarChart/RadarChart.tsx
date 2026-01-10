import React, { cloneElement, useMemo, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {
  Canvas,
  Path,
  Group,
  Circle,
} from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import useRadarChart from './useRadarChart';

export interface RadarDatum {
  values: number[];
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface RadarChartStyle extends CommonStyle {
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  centerDotRadius?: number;
  centerDotColor?: string;
}

export interface RadarChartProps {
  data: RadarDatum[];
  labels?: string[];
  levels?: number;
  labelViews?: ReactNode[];
  maxValue?: number;
  minValue?: number;
  style?: RadarChartStyle;
}

function RadarChart(props: RadarChartProps) {
    const {
    size,
    cx,
    cy,
    gridPaths,
    axisPaths,
    dataPaths,
    formattedLabels,
    formattedLabelViews,
    strokeWidth,
    strokeColor,
    centerDotRadius,
    centerDotColor,
  } = useRadarChart(props);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: props.style?.backgroundColor,
        },
      ]}
    >
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {/* grid polygons */}
          {gridPaths.map((gridPath, index) => (
            <Path
              key={index}
              path={gridPath}
              style="stroke"
              strokeWidth={strokeWidth}
              color={strokeColor}
            />
          ))}

          {axisPaths.map((ap, index) => (
            <Path
              key={index}
              path={ap}
              style="stroke"
              strokeWidth={strokeWidth}
              color={strokeColor}
            />
          ))}

          {dataPaths.map((pathDatum, index) => (
            <Group key={index}>
              <Path
                path={pathDatum.path}
                style="fill"
                color={pathDatum.backgroundColor}
              />
              <Path
                path={pathDatum.path}
                style="stroke"
                strokeWidth={pathDatum.strokeWidth}
                color={pathDatum.strokeColor}
              />
            </Group>
          ))}

          {/* center dot */}
          <Circle cx={cx} cy={cy} r={centerDotRadius} color={centerDotColor} />
        </Group>
      </Canvas>

      {/* Labels overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
        pointerEvents="none"
      >
        {formattedLabelViews &&
          formattedLabelViews.map((viewDataum, index) => {
            let style: ViewStyle = {
              position: 'absolute',
              bottom: viewDataum.y,
            };
            if (viewDataum.align === 'left') style.left = viewDataum.x;
            if (viewDataum.align === 'right') style.right = viewDataum.x;

            return (
              <View style={style} key={index}>
                {viewDataum.view}
              </View>
            );
          })}
        {formattedLabels &&
          formattedLabels.map((formatedlabel, index) => {
            let style: TextStyle = {
              position: 'absolute',
              bottom: formatedlabel.y,
              fontSize: 12,
              includeFontPadding: false,
            };

            if (formatedlabel.align === 'left') style.left = formatedlabel.x;
            if (formatedlabel.align === 'right') style.right = formatedlabel.x;

            return (
              <Text key={index} style={style}>
                {formatedlabel.label}
              </Text>
            );
          })}
      </View>
    </View>
  );
}

export default RadarChart;
