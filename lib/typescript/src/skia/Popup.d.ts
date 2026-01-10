import React from 'react';
export interface PopupStyle<T> {
    width?: number;
    height?: number;
    renderPopup?: (data: T) => React.ReactNode;
}
interface PopupData<T> {
    x: number;
    y: number;
    data: T;
}
interface PopupProps<T> {
    popupData?: PopupData<T> | PopupData<T>[];
    totalWidth: number;
    totalHeight: number;
    touchHandler?: (x: number, y: number) => void;
    onTouchOutside?: () => void;
    popupStyle?: PopupStyle<T>;
    viewOffset: {
        x: number;
        y: number;
    };
}
export default function Popup<T>({ popupData, totalWidth, totalHeight, touchHandler, onTouchOutside, popupStyle, viewOffset, }: PopupProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Popup.d.ts.map