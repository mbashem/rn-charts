"use strict";

import React from 'react';
import { Modal, View } from 'react-native';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export default function Popup({
  popupData,
  totalWidth,
  totalHeight,
  touchHandler,
  onTouchOutside,
  popupStyle,
  viewOffset
}) {
  return /*#__PURE__*/_jsx(_Fragment, {
    children: popupData && popupStyle?.renderPopup && /*#__PURE__*/_jsx(Modal, {
      animationType: "fade",
      transparent: true,
      visible: true,
      onRequestClose: () => {
        onTouchOutside?.();
      },
      onTouchStart: e => {
        console.log('modal touched ');
      },
      children: /*#__PURE__*/_jsxs(View, {
        style: {
          flex: 1,
          width: '100%',
          height: '100%'
        },
        onTouchStart: e => {
          const x = e.nativeEvent.pageX;
          const y = e.nativeEvent.pageY;
          touchHandler?.(x - viewOffset.x, y - viewOffset.y);
        },
        children: [popupData && !Array.isArray(popupData) && /*#__PURE__*/_jsx(View, {
          style: [{
            position: 'absolute',
            left: Math.max(0, Math.min(popupData.x, totalWidth - (popupStyle?.width ?? 0)) + viewOffset.x),
            top: Math.max(0, Math.min(popupData.y, totalHeight - (popupStyle?.height ?? 0)) + viewOffset.y)
          }],
          onTouchStart: e => e.stopPropagation(),
          children: popupStyle?.renderPopup(popupData.data)
        }), popupData && Array.isArray(popupData) && popupData.map((popupItem, index) => /*#__PURE__*/_jsx(View, {
          style: [{
            position: 'absolute',
            left: Math.max(0, Math.min(popupItem.x, totalWidth - (popupStyle?.width ?? 0)) + viewOffset.x),
            top: Math.max(0, Math.min(popupItem.y, totalHeight - (popupStyle?.height ?? 0)) + viewOffset.y)
          }],
          onTouchStart: e => e.stopPropagation(),
          children: popupStyle?.renderPopup?.(popupItem.data)
        }, index))]
      })
    })
  });
}
//# sourceMappingURL=Popup.js.map