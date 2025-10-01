import type { BarData, BarChartStyle } from "./BarChart";
import type { TooltipData } from "../Tooltip";
import { type GestureResponderEvent } from "react-native";
export default function useBarChart(data: BarData[], style?: BarChartStyle, maxValue?: number, minValue?: number): {
    maxValueCalculated: number;
    minValueCalculated: number;
    canvasHeight: number;
    canvasWidth: number;
    steps: number[];
    scrollAreaWidth: number;
    chartHeight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    verticalLabelWidth: number;
    chartBarWidth: number;
    chartBarSpacing: number;
    strokeWidth: number;
    rectangles: {
        bars: import("@shopify/react-native-skia").SkHostRect[];
        label: string | undefined;
    }[];
    tooltip: TooltipData | undefined;
    bottomLabelHeight: number;
    font: import("@shopify/react-native-skia").SkFont;
    setTooltip: import("react").Dispatch<import("react").SetStateAction<TooltipData | undefined>>;
    onCanvasTouchStart: (event: GestureResponderEvent) => void;
    onScroll: (translateX: number) => void;
};
//# sourceMappingURL=useBarChart.d.ts.map