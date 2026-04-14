export function multiply(a: number, b: number): number {
  return a * b;
}

export { default as BarChart } from "./skia/BarChart/BarChart";
export * from "./skia/BarChart/BarChart";

export { default as PieChart } from "./skia/PieChart/PieChart";
export * from "./skia/PieChart/PieChart";

export { default as AreaChart } from "./skia/AreaChart/AreaChart";
export * from "./skia/AreaChart/AreaChart";

// WILL be added later currently in experimental stage
// export * from "./skia/Progress/LinearProgress";

export { default as RadarChart } from "./skia/RadarChart/RadarChart";
export * from "./skia/RadarChart/RadarChart";

export { default as HeatMap } from "./skia/HeatMap/HeatMap";
export * from "./skia/HeatMap/HeatMap";

export { type HandleOutSideTouch } from "./skia/common";
