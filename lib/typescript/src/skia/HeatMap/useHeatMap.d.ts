import type { View } from "react-native-reanimated/lib/typescript/Animated";
import type { DayData, HeatMapProps } from "./HeatMap";
declare function useHeatMap({ startDate, endDate, data, style, minValue, maxValue, ref, popupStyle }: HeatMapProps): {
    daysInRange: DayData[];
    computedMin: number;
    computedMax: number;
    totalWidth: number;
    totalHeight: number;
    popupData: {
        x: number;
        y: number;
        day: DayData;
    } | undefined;
    popupRef: import("react").RefObject<View | null>;
    popupDimension: {
        width: number;
        height: number;
    };
    touchHandler: (x: number, y: number) => void;
    getColor: (value: number) => string;
    cellSize: number;
    onTouchOutside: () => void;
};
export default useHeatMap;
//# sourceMappingURL=useHeatMap.d.ts.map