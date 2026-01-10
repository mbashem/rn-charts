import { type CommonStyle } from '../common';
import { type PopupStyle } from '../Popup';
export interface PopupData {
    centerX: number;
    centerY: number;
    data: PieSlice;
}
export type PieSlice = {
    value: number;
    color?: string;
    label?: string;
};
export type PieChartProps = {
    slices: PieSlice[];
    style: PieChartStyles;
    centerView?: React.ReactNode;
    onSliceTouch?: (slice: PieSlice | undefined) => void;
    popupStyle?: PopupStyle<PieSlice>;
};
export interface PieChartStyles extends CommonStyle {
    radius?: number;
    innerRadius?: number;
    innerColor?: string;
}
declare function PieChart(props: PieChartProps): import("react/jsx-runtime").JSX.Element;
export default PieChart;
//# sourceMappingURL=PieChart.d.ts.map