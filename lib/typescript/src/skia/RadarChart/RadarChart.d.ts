import { type ReactNode } from 'react';
import { type CommonStyle } from '../common';
export interface RadarDatum {
    values: number[];
    backgroundColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}
export interface RadarChartStyle extends CommonStyle {
    size?: number;
    strokeWidth?: number;
    strokeColor?: string;
    centerDotRadius?: number;
    centerDotColor?: string;
}
export interface RadarChartProps {
    data: RadarDatum[];
    labels?: string[];
    levels?: number;
    labelViews?: ReactNode[];
    maxValue?: number;
    minValue?: number;
    style?: RadarChartStyle;
}
declare function RadarChart(props: RadarChartProps): import("react/jsx-runtime").JSX.Element;
export default RadarChart;
//# sourceMappingURL=RadarChart.d.ts.map