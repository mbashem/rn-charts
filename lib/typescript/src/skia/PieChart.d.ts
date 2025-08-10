import { type CommonStyles } from './common';
type PieSlice = {
    value: number;
    color?: string;
    label?: string;
};
interface PieChartStyles extends CommonStyles {
    diameter?: number;
}
export type PieChartProps = {
    slices: PieSlice[];
    styles: PieChartStyles;
};
declare function PieChart({ slices, styles }: PieChartProps): import("react/jsx-runtime").JSX.Element;
export default PieChart;
//# sourceMappingURL=PieChart.d.ts.map