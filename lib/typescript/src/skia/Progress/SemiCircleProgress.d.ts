import type { CommonStyle } from '../common';
export interface SemiCircleProgressStyles extends CommonStyle {
    width?: number;
    height?: number;
    radius?: number;
    tintColor?: string;
    backgroundColor?: string;
    tintColors?: string[];
    tineColorsPositions?: number[];
    backgroundColors?: string[];
    backgroundColorsPositions?: number[];
}
export interface SemiCircleProgressProps {
    style: SemiCircleProgressStyles;
    progress: number;
}
export default function SemiCircleProgress({ progress, style, }: SemiCircleProgressProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SemiCircleProgress.d.ts.map