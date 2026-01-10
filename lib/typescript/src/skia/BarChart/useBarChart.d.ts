import type { StackValue, BarChartProps } from "./BarChart";
export default function useBarChart({ data, style, maxValue, minValue }: BarChartProps): {
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
        dataIndex: number;
        x: number;
    }[];
    tooltip: {
        centerX: number;
        centerY: number;
        data: StackValue;
    } | undefined;
    bottomLabelHeight: number;
    font: import("@shopify/react-native-skia").SkFont;
    setTooltip: import("react").Dispatch<import("react").SetStateAction<{
        centerX: number;
        centerY: number;
        data: StackValue;
    } | undefined>>;
    touchHandler: (touchedX: number, touchedY: number) => void;
    onScroll: (translateX: number) => void;
    totalHeight: number;
    totalWidth: number;
};
//# sourceMappingURL=useBarChart.d.ts.map