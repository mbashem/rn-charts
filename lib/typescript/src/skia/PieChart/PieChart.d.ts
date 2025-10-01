import { type CommonStyle } from '../common';
import { type PieSlice } from './usePieChart';
export type PieChartProps = {
    slices: PieSlice[];
    style: PieChartStyles;
    centerView?: React.ReactNode;
    onSliceTouch?: (slice: PieSlice | undefined) => void;
    showTooltipOnTouch?: boolean;
};
export interface PieChartStyles extends CommonStyle {
    radius?: number;
    innerRadius?: number;
    innerColor?: string;
}
declare function PieChart({ style, slices, centerView, onSliceTouch, showTooltipOnTouch, }: PieChartProps): import("react/jsx-runtime").JSX.Element;
export default PieChart;
//# sourceMappingURL=PieChart.d.ts.map