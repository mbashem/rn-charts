import { type CommonStyle } from '../common';
interface VerticalLabelStyles extends CommonStyle {
    width: number;
    height: number;
    strokeWidth?: number;
    strokeColor?: string;
    textColor?: string;
}
interface VerticalLabelProps {
    minValue: number;
    maxValue: number;
    labelCount: number;
    styles: VerticalLabelStyles;
}
declare function VerticalLabel({ minValue, maxValue, labelCount, styles, }: VerticalLabelProps): import("react/jsx-runtime").JSX.Element;
export default VerticalLabel;
//# sourceMappingURL=VerticalLabel.d.ts.map