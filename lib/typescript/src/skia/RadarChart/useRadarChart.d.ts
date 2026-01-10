import { type SkPath } from "@shopify/react-native-skia";
import type { RadarChartProps } from "./RadarChart";
export interface RadarDatum {
    values: number[];
    backgroundColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}
export default function useRadarChart({ data, labels, labelViews, levels, maxValue, minValue, style, }: RadarChartProps): {
    size: number;
    cx: number;
    cy: number;
    radius: number;
    safeMax: number;
    angles: number[];
    gridPaths: SkPath[];
    axisPaths: SkPath[];
    dataPaths: {
        backgroundColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
        path: SkPath;
    }[];
    formattedLabels: {
        x: number;
        y: number;
        label: string;
        align: "left" | "center" | "right";
    }[] | undefined;
    formattedLabelViews: {
        x: number;
        y: number;
        view: React.ReactNode;
        align: "left" | "center" | "right";
    }[] | undefined;
    strokeWidth: number;
    strokeColor: string;
    centerDotRadius: number;
    centerDotColor: string;
};
//# sourceMappingURL=useRadarChart.d.ts.map