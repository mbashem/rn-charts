import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { RnPopupView } from '@bashem/rn-popup';

let didWarnAboutMissingDimensions = false;

export interface PopupStyle<T> {
  width?: number;
  height?: number;
  passThrough?: boolean;
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

interface PopupItem<T> {
  data: T;
  frame: PopupFrame;
}

interface PopupFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function asPopupArray<T>(popupData?: PopupData<T> | PopupData<T>[]) {
  if (!popupData) {
    return [];
  }

  return Array.isArray(popupData) ? popupData : [popupData];
}

export default function Popup<T>({
  popupData,
  totalWidth,
  totalHeight,
  touchHandler,
  onTouchOutside,
  popupStyle,
  viewOffset,
}: PopupProps<T>) {
  const windowDimensions = useWindowDimensions();

  if (!popupData || !popupStyle?.renderPopup) {
    return null;
  }

  const popupWidth = popupStyle.width;
  const popupHeight = popupStyle.height;
  const renderPopup = popupStyle.renderPopup;

  if (
    typeof popupWidth !== 'number' ||
    popupWidth <= 0 ||
    typeof popupHeight !== 'number' ||
    popupHeight <= 0
  ) {
    if (__DEV__ && !didWarnAboutMissingDimensions) {
      didWarnAboutMissingDimensions = true;
      console.warn(
        'rn-charts popupStyle.width and popupStyle.height are required for native rn-popup windows.'
      );
    }

    return null;
  }

  const popupItems: PopupItem<T>[] = asPopupArray(popupData).map((item) => ({
    data: item.data,
    frame: {
      x: clamp(item.x, 0, totalWidth - popupWidth),
      y: clamp(item.y, 0, totalHeight - popupHeight),
      width: popupWidth,
      height: popupHeight,
    },
  }));
  const passThrough = popupStyle.passThrough ?? true;
  const overlayWidth = Math.max(
    windowDimensions.width,
    viewOffset.x + totalWidth
  );
  const overlayHeight = Math.max(
    windowDimensions.height,
    viewOffset.y + totalHeight
  );
  const handleDismiss = () => {
    if (onTouchOutside) {
      onTouchOutside();
      return;
    }

    touchHandler?.(-1, -1);
  };
  const handleOutsideTouch = () => {
    handleDismiss();
  };

  return (
    <RnPopupView
      color="transparent"
      onOutsideTouch={handleOutsideTouch}
      passThrough={passThrough}
      style={{
        position: 'absolute',
        left: -viewOffset.x,
        top: -viewOffset.y,
        width: overlayWidth,
        height: overlayHeight,
      }}
    >
      {popupItems.map(({ data, frame }, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: viewOffset.x + frame.x,
            top: viewOffset.y + frame.y,
            width: frame.width,
            height: frame.height,
          }}
        >
          {renderPopup(data)}
        </View>
      ))}
    </RnPopupView>
  );
}
