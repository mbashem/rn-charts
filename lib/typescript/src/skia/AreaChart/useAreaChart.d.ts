import { type SkPath } from "@shopify/react-native-skia";
import type { AreaChartProps } from "./AreaChart";
export interface AreaData {
    values: number[];
    label?: string;
    color?: string;
}
interface Point {
    x: number;
    y: number;
}
export interface PathData {
    path: SkPath;
    points: Point[];
    values: number[];
    color?: string;
    label?: string;
}
export interface XLable {
    label: string;
    xPosition: number;
}
interface TouchLine {
    col: number;
    x: number;
    y: number[];
    values: number[];
}
declare function useAreaChart({ data, xLabels, maxValue, minValue, style, }: AreaChartProps): {
    paths: PathData[];
    chartWidth: number;
    canvasHeight: number;
    paddingLeft: number;
    paddingTop: number;
    paddingHorizontal: number;
    areaCanvasHeight: number;
    labelWidth: number;
    maxValue: number;
    minValue: number;
    xLabelsData: XLable[];
    xLabelHeight: number;
    font: import("@shopify/react-native-skia").SkFont;
    touchHandler: (touchedX: number, touchedY: number) => void;
    touchLine: TouchLine | undefined;
};
export default useAreaChart;
//# sourceMappingURL=useAreaChart.d.ts.map