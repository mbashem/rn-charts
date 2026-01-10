import { type SkFont } from "@shopify/react-native-skia";
export interface CommonStyle {
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingStart?: number;
    paddingEnd?: number;
    paddingLeft?: number;
    paddingRight?: number;
    backgroundColor?: string;
    disableRTL?: boolean;
    font?: SkFont;
    fontSize?: number;
}
export declare function getCommonStyleFont(style?: CommonStyle): {
    font: SkFont;
    fontSize: number;
};
export declare function getPaddings(style?: CommonStyle): {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    paddingHorizontal: number;
    paddingVertical: number;
};
export declare function getRandomRGBColor(): string;
export declare const systemFontFamilies: string[];
export declare function getFont(size?: number): SkFont;
export declare const font: SkFont;
//# sourceMappingURL=common.d.ts.map