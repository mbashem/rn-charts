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
  Skia,
  Group,
  type SkPath,
  Circle,
} from '@shopify/react-native-skia';
import { getPaddings, type CommonStyle } from '../common';
import useRadarChart from './useRadarChart';

type Point = { x: number; y: number };

export interface RadarDatum {
  values: number[];
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

interface RadarChartStyle extends CommonStyle {
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  centerDotRadius?: number;
  centerDotColor?: string;
}

interface RadarChartProps {
  data: RadarDatum[];
  labels?: string[];
  labelViews?: ReactNode[];
  maxValue?: number;
  minValue?: number;
  style?: RadarChartStyle;
}

function RadarChart({
  data,
  labels,
  labelViews,
  maxValue,
  minValue = 0,
  style,
}: RadarChartProps) {
  const {} = useRadarChart();
  const safeMax = useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    let currentMaxValue = minValue;
    for (let datum of data)
      for (let value of datum.values) {
        currentMaxValue = Math.max(currentMaxValue, value);
      }
    return currentMaxValue;
  }, [data, maxValue]);

  const size = style?.size ?? 200;
  const { paddingHorizontal, paddingVertical } = getPaddings(style);

  const radius = size / 2 - Math.max(paddingHorizontal, paddingVertical) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const angles = useMemo(
    () =>
      data[0]?.values.map(
        (_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / data.length
      ) ?? [],
    [data[0]?.values.length]
  );

  // helper to calculate (x,y) for given angle and r (from center)
  const pointFor = (angle: number, r: number): Point => ({
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  });

  const levels = 5;

  // Precompute grid paths (concentric polygons)
  const gridPaths = useMemo(() => {
    const arr: SkPath[] = [];
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels;
      const p = Skia.Path.Make();
      angles.forEach((angle, i) => {
        const pt = pointFor(angle, levelRadius);
        if (i === 0) p.moveTo(pt.x, pt.y);
        else p.lineTo(pt.x, pt.y);
      });
      p.close();
      arr.push(p);
    }
    return arr;
  }, [levels, radius, cx, cy, angles]);

  // Axis lines path (one path per axis)
  const axisPaths = useMemo(() => {
    return angles.map((angle) => {
      const path = Skia.Path.Make();
      const outer = pointFor(angle, radius);
      path.moveTo(cx, cy);
      path.lineTo(outer.x, outer.y);
      return path;
    });
  }, [angles, radius, cx, cy]);

  // Data polygon path
  const dataPaths = useMemo(() => {
    const paths = data.map(({ values, ...rest }) => {
      const path = Skia.Path.Make();
      values.forEach((value, index) => {
        const currentRadius =
          Math.max(0, Math.min(1, value / safeMax)) * radius;
        const point = pointFor(angles[index]!, currentRadius);
        if (index === 0) path.moveTo(point.x, point.y);
        else path.lineTo(point.x, point.y);
      });

      path.close();
      return { path: path, ...rest };
    });

    return paths;
  }, [data, radius, safeMax, angles]);

  // Label positions (rendered as RN Text overlay)
  const formatedlabels = useMemo(() => {
		if (labels === undefined) return undefined;
    const out: {
      x: number;
      y: number;
      label: string;
      align: 'left' | 'center' | 'right';
    }[] = [];
    const labelRadius = radius + 12;
    angles.forEach((angle, i) => {
      const pt = pointFor(angle, labelRadius);
      const deg = (angle * 180) / Math.PI;
      let align: 'left' | 'center' | 'right' = 'center';
      if (deg > -90 && deg < 90)
        align = 'left';
      else if (deg > 90 || deg < -90) align = 'right', pt.x = size - pt.x;
      else align = 'center';
      out.push({ x: pt.x, y: pt.y, label: labels[i]!, align });
    });
    return out;
  }, [angles, radius, labels]);

  const formatedLabelViews = useMemo(() => {
    if (labelViews === undefined) return undefined;
    const out: {
      x: number;
      y: number;
      view: ReactNode;
      align: 'left' | 'center' | 'right';
    }[] = [];
    const labelRadius = radius + 12;
    angles.forEach((angle, i) => {
      const pt = pointFor(angle, labelRadius);
      const degree = (angle * 180) / Math.PI;
      let alignment: 'left' | 'center' | 'right' = 'center';
      if (degree > -90 && degree < 90)
        alignment = 'left';
      else if (degree > 90 || degree < -90) alignment = 'right', pt.x = size - pt.x;
      else alignment = 'center';
      out.push({ x: pt.x, y: pt.y, view: labelViews[i]!, align: alignment });
    });
    return out;
  }, [angles, radius, labelViews]);

  const strokeWidth = style?.strokeWidth ?? 2;
  const strokeColor = style?.strokeColor ?? 'gray';
  const centerDotRadius = style?.centerDotRadius ?? 5;
  const centerDotColor = style?.centerDotColor ?? strokeColor;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: style?.backgroundColor,
        },
      ]}
    >
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {/* grid polygons */}
          {gridPaths.map((gridPath, idx) => (
            <Path
              key={'g' + idx}
              path={gridPath}
              style="stroke"
              strokeWidth={strokeWidth}
              color={strokeColor}
            />
          ))}

          {axisPaths.map((ap, idx) => (
            <Path
              key={'a' + idx}
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
        {formatedLabelViews && formatedLabelViews.map((viewDataum, index) => {
          const top = viewDataum.y;
          let style: ViewStyle = {
            position: 'absolute',
            top: top,
          };
          if (viewDataum.align === 'left') style.left = viewDataum.x;
          if (viewDataum.align === 'right') style.right = viewDataum.x;

          return (
            <View style={style} key={index}>
              {viewDataum.view}
            </View>
          );
        })}
        {formatedlabels && formatedlabels.map((formatedlabel, index) => {
          const top = formatedlabel.y;
          let style: TextStyle = {
            position: 'absolute',
            top: top - 6,
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
