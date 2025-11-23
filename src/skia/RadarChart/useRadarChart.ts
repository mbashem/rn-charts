import { useMemo } from "react";
import { Skia, type SkPath } from "@shopify/react-native-skia";
import { arrayFrom } from "../../util/util";
import { getPaddings, type CommonStyle } from "../common";
import type { RadarChartProps } from "./RadarChart";

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

export default function useRadarChart({
  data,
  labels,
  labelViews,
  levels = 5,
  maxValue,
  minValue = 0,
  style,
}: RadarChartProps) {
  const size = style?.size ?? 200;
  const { paddingHorizontal, paddingVertical } = getPaddings(style);

  const radius = size / 2 - Math.max(paddingHorizontal, paddingVertical) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Compute max value
  const safeMax = useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    let m = minValue;
    for (let datum of data)
      for (let v of datum.values) m = Math.max(m, v);
    return m;
  }, [data, maxValue]);

  // Determine number of axes
  const angles = useMemo(() => {
    let len = data[0]?.values.length ?? 0;
    if (len === 0 && labels) len = labels.length;
    if (len === 0 && labelViews) len = labelViews.length;
    if (len === 0) return [];

    return arrayFrom(len, 1).map(
      (i) => -Math.PI / 2 + (i * 2 * Math.PI) / len
    );
  }, [data[0]?.values.length, labels?.length, labelViews?.length]);

  const pointFor = (angle: number, r: number): Point => ({
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  });

  // ------------------------------
  // Grid paths
  // ------------------------------
  const gridPaths = useMemo(() => {
    const arr: SkPath[] = [];
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius * lvl) / levels;
      const p = Skia.Path.Make();
      angles.forEach((angle, i) => {
        const pt = pointFor(angle, r);
        if (i === 0) p.moveTo(pt.x, pt.y);
        else p.lineTo(pt.x, pt.y);
      });
      p.close();
      arr.push(p);
    }
    return arr;
  }, [levels, radius, angles]);

  // ------------------------------
  // Axis paths
  // ------------------------------
  const axisPaths = useMemo(
    () =>
      angles.map((angle) => {
        const p = Skia.Path.Make();
        const outer = pointFor(angle, radius);
        p.moveTo(cx, cy);
        p.lineTo(outer.x, outer.y);
        return p;
      }),
    [angles, radius]
  );

  // ------------------------------
  // Data polygons
  // ------------------------------
  const dataPaths = useMemo(() => {
    return data.map(({ values, ...rest }) => {
      const path = Skia.Path.Make();
      values.forEach((v, i) => {
        const r = Math.max(0, Math.min(1, v / safeMax)) * radius;
        const pt = pointFor(angles[i]!, r);
        if (i === 0) path.moveTo(pt.x, pt.y);
        else path.lineTo(pt.x, pt.y);
      });
      path.close();
      return { path, ...rest };
    });
  }, [data, radius, safeMax, angles]);

  // ------------------------------
  // Labels
  // ------------------------------
  const formattedLabels = useMemo(() => {
    if (!labels) return undefined;

    const arr: {
      x: number;
      y: number;
      label: string;
      align: "left" | "center" | "right";
    }[] = [];

    const r = radius + 12;

    angles.forEach((angle, i) => {
      const p = pointFor(angle, r);
      const deg = (angle * 180) / Math.PI;

      let align: "left" | "center" | "right" = "center";
      if (deg > -90 && deg < 90) align = "left";
      else if (deg < -90 || deg > 90) {
        align = "right";
        p.x = size - p.x;
      }

      arr.push({
        x: p.x,
        y: size - p.y,
        label: labels[i]!,
        align,
      });
    });

    return arr;
  }, [labels, angles, radius]);

  // ------------------------------
  // Label Views
  // ------------------------------
  const formattedLabelViews = useMemo(() => {
    if (!labelViews) return undefined;

    const arr: {
      x: number;
      y: number;
      view: React.ReactNode;
      align: "left" | "center" | "right";
    }[] = [];

    const r = radius + 12;

    angles.forEach((angle, i) => {
      const p = pointFor(angle, r);
      const deg = (angle * 180) / Math.PI;

      let align: "left" | "center" | "right" = "center";
      if (deg > -90 && deg < 90) align = "left";
      else if (deg < -90 || deg > 90) {
        align = "right";
        p.x = size - p.x;
      }

      arr.push({
        x: p.x,
        y: size - p.y,
        view: labelViews[i]!,
        align,
      });
    });

    return arr;
  }, [labelViews, angles, radius]);

  return {
    size,
    cx,
    cy,
    radius,
    safeMax,
    angles,
    gridPaths,
    axisPaths,
    dataPaths,
    formattedLabels,
    formattedLabelViews,
    strokeWidth: style?.strokeWidth ?? 2,
    strokeColor: style?.strokeColor ?? "gray",
    centerDotRadius: style?.centerDotRadius ?? 2,
    centerDotColor: style?.centerDotColor ?? style?.strokeColor ?? "gray",
  };
}
