import { type CommonStyles } from "../common";
export interface StackValue {
    value: number;
    label: string;
    id?: string;
}
export interface BarData {
    values: StackValue[];
    label: string;
}
export interface BarChartStyle extends CommonStyles {
    width?: number;
    height?: number;
}
export interface BarChartProps {
    data: BarData[];
    colors?: Record<string, string>;
    maxValue?: number;
    minValue?: number;
    style?: BarChartStyle;
}
declare function BarChart({ data, colors, maxValue, minValue, style }: BarChartProps): import("react/jsx-runtime").JSX.Element;
export default BarChart;
//# sourceMappingURL=BarChart.d.ts.map