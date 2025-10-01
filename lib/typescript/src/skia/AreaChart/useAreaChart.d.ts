import { type SkPath } from "@shopify/react-native-skia";
import type { AreaChartStyle } from "./AreaChart";
import type { GestureResponderEvent } from "react-native";
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
    color?: string;
    label?: string;
}
export interface XLable {
    label: string;
    xPosition: number;
}
interface TouchLine {
    x: number;
    y: number[];
}
declare function useAreaChart(data: AreaData[], xLabels?: string[], maxValue?: number, minValue?: number, style?: AreaChartStyle): {
    paths: PathData[];
    chartWidth: number;
    canvasHeight: number;
    areaCanvasHeight: number;
    labelWidth: number;
    maxValue: number;
    minValue: number;
    xLabelsData: XLable[];
    xLabelHeight: number;
    font: import("@shopify/react-native-skia").SkFont;
    onCanvasTouchStart: (event: GestureResponderEvent) => void;
    touchLine: TouchLine | undefined;
};
export default useAreaChart;
//# sourceMappingURL=useAreaChart.d.ts.map