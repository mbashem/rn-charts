import type { PieChartProps, PopupData } from "./PieChart";
export declare function usePieChart({ slices, style, onSliceTouch }: PieChartProps): {
    paths: {
        path: import("@shopify/react-native-skia").SkPath;
        color: string;
    }[];
    diameter: number;
    innerRadius: number;
    radius: number;
    popupData: PopupData | undefined;
    touchHandler: (locationX: number, locationY: number) => void;
};
//# sourceMappingURL=usePieChart.d.ts.map