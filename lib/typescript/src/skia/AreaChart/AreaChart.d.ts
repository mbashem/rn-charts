import { type CommonStyle } from '../common';
import { type AreaData } from './useAreaChart';
export interface AreaChartStyle extends CommonStyle {
    width: number;
    height: number;
    showPoints?: boolean;
    pointRadius?: number;
    lightenPointsBy?: number;
}
interface AreaChartProps {
    data: AreaData[];
    minValue?: number;
    maxValue?: number;
    xLabels?: string[];
    style?: AreaChartStyle;
}
declare function AreaChart({ data, xLabels, minValue: minValueProp, maxValue: maxValueProp, style, }: AreaChartProps): import("react/jsx-runtime").JSX.Element;
export default AreaChart;
//# sourceMappingURL=AreaChart.d.ts.map