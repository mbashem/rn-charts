import type { CommonStyle } from '../common';
export interface LinearProgressStyles extends CommonStyle {
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
export interface LinearProgressProps {
    style: LinearProgressStyles;
    progress: number;
}
export default function LinearProgress({ progress, style, }: LinearProgressProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LinearProgress.d.ts.map