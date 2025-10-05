import React, { cloneElement, useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
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
  labels: string[];
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
      labels.map(
        (_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / data.length
      ),
    [labels.length]
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
    for (let lev = 1; lev <= levels; lev++) {
      const r = (radius * lev) / levels;
      const p = Skia.Path.Make();
      angles.forEach((ang, i) => {
        const pt = pointFor(ang, r);
        if (i === 0) p.moveTo(pt.x, pt.y);
        else p.lineTo(pt.x, pt.y);
      });
      p.close();
      arr.push(p);
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, radius, cx, cy, angles.join?.(',') /* eslint: defensive */]);

  // Axis lines path (one path per axis)
  const axisPaths = useMemo(() => {
    return angles.map((ang) => {
      const p = Skia.Path.Make();
      const outer = pointFor(ang, radius);
      p.moveTo(cx, cy);
      p.lineTo(outer.x, outer.y);
      return p;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angles.join?.(','), radius, cx, cy]);

  // Data polygon path
  const dataPaths = useMemo(() => {
    const paths = data.map(({ values, ...rest }) => {
      const path = Skia.Path.Make();
      values.forEach((value, index) => {
        const r = Math.max(0, Math.min(1, value / safeMax)) * radius;
        const point = pointFor(angles[index]!, r);
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
    const out: {
      x: number;
      y: number;
      label: string;
      align: 'left' | 'center' | 'right';
    }[] = [];
    const labelRadius = radius + 12; // label distance from center (slightly outside)
    angles.forEach((ang, i) => {
      const pt = pointFor(ang, labelRadius);
      // decide alignment based on angle quadrant
      const deg = (ang * 180) / Math.PI;
      let align: 'left' | 'center' | 'right' = 'center';
      if (deg > -90 && deg < 90)
        align = 'left'; // right side -> label left aligned to avoid overflow
      else if (deg > 90 || deg < -90) align = 'right';
      else align = 'center';
      out.push({ x: pt.x, y: pt.y, label: labels[i]!, align });
    });
    return out;
  }, [angles, radius, labels.join(',')]);

  const formatedLabelViews = useMemo(() => {
    if (labelViews === undefined) return [];
    const out: {
      x: number;
      y: number;
      view: ReactNode;
      align: 'left' | 'center' | 'right';
    }[] = [];
    const labelRadius = radius + 12; // label distance from center (slightly outside)
    angles.forEach((ang, i) => {
      const pt = pointFor(ang, labelRadius);
      // decide alignment based on angle quadrant
      const deg = (ang * 180) / Math.PI;
      let align: 'left' | 'center' | 'right' = 'center';
      if (deg > -90 && deg < 90)
        align = 'left'; // right side -> label left aligned to avoid overflow
      else if (deg > 90 || deg < -90) align = 'right';
      else align = 'center';
      out.push({ x: pt.x, y: pt.y, view: labelViews[i]!, align });
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
          {gridPaths.map((gp, idx) => (
            <Path
              key={'g' + idx}
              path={gp}
              style="stroke"
              strokeWidth={strokeWidth}
              color={strokeColor}
            />
          ))}

          {/* axis lines */}
          {axisPaths.map((ap, idx) => (
            <Path
              key={'a' + idx}
              path={ap}
              style="stroke"
              strokeWidth={strokeWidth}
              color={strokeColor}
            />
          ))}

          {dataPaths.map((pathDatum) => (
            <Group>
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

          {/* data polygon stroke */}

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
        {/* {formatedLabelViews.map((viewDataum) => {
          if (React.isValidElement(viewDataum.view)) {
            const left = viewDataum.x;
            const top = viewDataum.y;
            let transformStyle: ViewStyle = {
              position: 'absolute',
              left: left - 10,
              top: top - 8,
            };
            let newView = React.cloneElement(viewDataum.view, {
              style: {
                position: 'absolute',
                left: transformStyle.left,
                top: transformStyle.top,
              },
            });
            return newView;
          }
          return viewDataum.view;
        })} */}
        {formatedlabels.map((l, i) => {
          // compute transform to position each label; adjust small offsets for nicer placement
          const left = l.x;
          const top = l.y;
          let transformStyle: ViewStyle = {
            position: 'absolute',
            left: left - 10,
            top: top - 8,
          };
          // adjust based on alignment
          if (l.align === 'left') transformStyle.left = left + 4;
          if (l.align === 'right') transformStyle.left = left - 60; // assume label width up to ~50
          return (
            <Text
              key={'lbl' + i}
              style={[
                {
                  position: 'absolute',
                  left: transformStyle.left,
                  top: transformStyle.top,
                  fontSize: 12,
                  includeFontPadding: false,
                },
              ]}
            >
              {l.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export default RadarChart;
