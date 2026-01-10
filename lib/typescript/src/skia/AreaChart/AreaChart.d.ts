import { type CommonStyle } from '../common';
import { type AreaData } from './useAreaChart';
import { type PopupStyle } from '../Popup';
export interface AreaChartStyle extends CommonStyle {
    width: number;
    height: number;
    showPoints?: boolean;
    pointRadius?: number;
    lightenPointsBy?: number;
}
export interface AreaChartProps {
    data: AreaData[];
    minValue?: number;
    maxValue?: number;
    xLabels?: string[];
    style?: AreaChartStyle;
    popupStyle: PopupStyle<{
        rowIndex: number;
        colIndex: number;
        value: number;
    }>;
}
declare function AreaChart(props: AreaChartProps): import("react/jsx-runtime").JSX.Element;
export default AreaChart;
//# sourceMappingURL=AreaChart.d.ts.map