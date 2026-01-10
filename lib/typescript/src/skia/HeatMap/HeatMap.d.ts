import { type Ref } from 'react';
import type { CommonStyle } from '../common';
import { type PopupStyle } from '../Popup';
export type DayData = {
    date: string;
    value: number;
    dayOfWeek: number;
    week: number;
    x: number;
    y: number;
};
export interface HandleOutSideTouch {
    touchedOutside: () => void;
}
export interface HeatMapStyle extends CommonStyle {
    cellSize?: number;
    cellGap?: number;
    cellMaxColor?: string;
    cellMinColor?: string;
}
export interface HeatMapProps {
    startDate: string;
    endDate: string;
    data?: Record<string, number>;
    style?: HeatMapStyle;
    minValue?: number;
    maxValue?: number;
    ref?: Ref<HandleOutSideTouch | undefined>;
    popupStyle?: PopupStyle<DayData>;
}
declare function HeatMap(props: HeatMapProps): import("react/jsx-runtime").JSX.Element;
export default HeatMap;
//# sourceMappingURL=HeatMap.d.ts.map