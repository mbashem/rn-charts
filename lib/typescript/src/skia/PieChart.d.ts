import { type CommonStyles } from "./common";
type PieSlice = {
    value: number;
    color?: string;
    label?: string;
};
interface PieChartStyles extends CommonStyles {
    diameter?: number;
}
type Props = {
    slices: PieSlice[];
    styles: PieChartStyles;
};
declare function PieChart({ slices, styles }: Props): import("react/jsx-runtime").JSX.Element;
export default PieChart;
//# sourceMappingURL=PieChart.d.ts.map