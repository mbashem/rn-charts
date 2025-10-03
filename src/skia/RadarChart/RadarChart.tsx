import React, { useMemo } from 'react';
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

type Point = { x: number; y: number };
export interface RadarDatum {
  label: string;
  value: number;
}

interface RadarChartStyle extends CommonStyle {
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
}

interface RadarChartProps {
  data: RadarDatum[];
  maxValue?: number;
  minValue?: number;
  style?: RadarChartStyle;
}

function RadarChart({ data, maxValue, minValue = 0, style }: RadarChartProps) {
  const safeMax = useMemo(
    () => maxValue ?? Math.max(...data.map((d) => d.value), 1),
    [data, maxValue]
  );

  const size = style?.size ?? 200;
  const { paddingHorizontal, paddingVertical } = getPaddings(style);

  const radius = size / 2 - Math.max(paddingHorizontal, paddingVertical) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const angles = useMemo(
    () =>
      data.map(
        (_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / data.length
      ),
    [data]
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
  const dataPath = useMemo(() => {
    const p = Skia.Path.Make();
    data.forEach((d, i) => {
      const r = Math.max(0, Math.min(1, d.value / safeMax)) * radius;
      const pt = pointFor(angles[i]!, r);
      if (i === 0) p.moveTo(pt.x, pt.y);
      else p.lineTo(pt.x, pt.y);
    });
    p.close();
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.map((d) => d.value).join(','), radius, safeMax, angles.join?.(',')]);

  // Label positions (rendered as RN Text overlay)
  const labels = useMemo(() => {
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
      out.push({ x: pt.x, y: pt.y, label: data[i]!.label, align });
    });
    return out;
  }, [angles.join?.(','), radius, data.map((d) => d.label).join(',')]);

  const strokeWidth = style?.strokeWidth ?? 2;
  const strokeColor = style?.strokeColor ?? 'blue';

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: style?.backgroundColor ?? 'transparent',
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
              strokeWidth={1}
              color={'gray'}
            />
          ))}

          {/* axis lines */}
          {axisPaths.map((ap, idx) => (
            <Path
              key={'a' + idx}
              path={ap}
              style="stroke"
              strokeWidth={1}
              color={'gray'}
            />
          ))}

          {/* data polygon fill */}
          <Path path={dataPath} style="fill" color={'red'} />

          {/* data polygon stroke */}
          <Path
            path={dataPath}
            style="stroke"
            strokeWidth={strokeWidth}
            color={strokeColor}
          />

          {/* center dot */}
          <Circle cx={cx} cy={cy} r={4} color={strokeColor} />
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
        {labels.map((l, i) => {
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
