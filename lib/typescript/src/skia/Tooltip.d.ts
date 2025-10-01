export interface ToolTipStyles {
    padding?: number;
}
export interface TooltipData {
    centerX: number;
    centerY: number;
    label: string;
}
interface ToolTipProps {
    data: TooltipData | undefined;
    style?: ToolTipStyles;
}
export default function ToolTip({ data, style }: ToolTipProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=Tooltip.d.ts.map