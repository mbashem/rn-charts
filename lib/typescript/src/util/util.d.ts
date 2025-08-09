import { type ReactNode } from "react";
export declare const stringToArray: (s: string, separator: string) => string[];
export declare const increment: (char: string, by: number) => string;
export declare const getRandomInteger: (min: number, max: number) => number;
export declare const parseQuery: (queryString: string) => Record<string, string>;
export declare const processNumber: (num: number, min: number, max: number) => number;
/**
 *
 * @param {number} value - The number.
 * @param {Intl.NumberFormatOptions} options - The options.
 *  Default Value: { maximumFractionDigits: 2, minimumFractionDigits: 0 }
 * @returns {string} Returns the number in as formatted string.
 *
 * @example
 * const result = getFormattedString(3.012)
 * console.log(result); // 3.01
 */
export declare function getFormattedString(value: number, options?: Intl.NumberFormatOptions): string;
export declare function isNumber<T>(value: T | number): value is number;
export declare function isNonNANNumber<T>(value: T | number): value is number;
export declare function isStringNumber(value: string): boolean;
export declare function isDefined<T>(value: T | undefined | null): value is T;
export declare function isFunction(value: any): value is Function;
export declare function isString(node: ReactNode): node is string;
//# sourceMappingURL=util.d.ts.map