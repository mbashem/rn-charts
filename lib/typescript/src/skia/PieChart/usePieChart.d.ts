import type { PieChartStyles } from "./PieChart";
import type { TooltipData } from "../Tooltip";
import type { GestureResponderEvent } from "react-native";
export type PieSlice = {
    value: number;
    color?: string;
    label?: string;
};
export declare function usePieChart(slices: PieSlice[], style?: PieChartStyles, onSliceTouch?: (slice: PieSlice | undefined) => void, showTooltipOnTouch?: boolean): {
    paths: {
        path: import("@shopify/react-native-skia").SkPath;
        color: string;
    }[];
    diameter: number;
    innerRadius: number;
    radius: number;
    tooltip: TooltipData | undefined;
    setTooltip: import("react").Dispatch<import("react").SetStateAction<TooltipData | undefined>>;
    onCanvasTouchStart: (event: GestureResponderEvent) => void;
};
//# sourceMappingURL=usePieChart.d.ts.map