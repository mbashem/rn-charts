import { type CommonStyle } from '../common';
import { type PopupStyle } from '../Popup';
export interface StackValue {
    value: number;
    label: string;
    id?: string;
}
export interface BarData {
    values: StackValue[];
    label?: string;
}
export interface BarChartStyle extends CommonStyle {
    width?: number;
    height?: number;
    barWidth?: number;
    barSpacing?: number;
    firstBarLeadingSpacing?: number;
    lastBarTrailingSpacing?: number;
}
export interface BarChartProps {
    data: BarData[];
    colors?: Record<string, string>;
    maxValue?: number;
    minValue?: number;
    popupStyle?: PopupStyle<StackValue>;
    style?: BarChartStyle;
}
declare function BarChart(props: BarChartProps): import("react/jsx-runtime").JSX.Element;
export default BarChart;
//# sourceMappingURL=BarChart.d.ts.map