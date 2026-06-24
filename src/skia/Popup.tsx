import { useWindowDimensions, View } from "react-native";
import { Popup as NativePopup } from "@bashem/rn-popup";
import type { ReactNode } from "react";

let didWarnAboutMissingDimensions = false;

export interface PopupStyle<T> {
  width?: number;
  height?: number;
  passThrough?: boolean;
  renderPopup?: (data: T) => ReactNode;
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

function getPopupBounds<T>(items: PopupItem<T>[]): PopupFrame {
  const minX = Math.min(...items.map((item) => item.frame.x));
  const minY = Math.min(...items.map((item) => item.frame.y));
  const maxX = Math.max(
    ...items.map((item) => item.frame.x + item.frame.width)
  );
  const maxY = Math.max(
    ...items.map((item) => item.frame.y + item.frame.height)
  );

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
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
    typeof popupWidth !== "number" ||
    popupWidth <= 0 ||
    typeof popupHeight !== "number" ||
    popupHeight <= 0
  ) {
    if (__DEV__ && !didWarnAboutMissingDimensions) {
      didWarnAboutMissingDimensions = true;
      console.warn(
        "rn-charts popupStyle.width and popupStyle.height are required for native rn-popup windows."
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

  if (popupItems.length === 0) {
    return null;
  }

  const popupBounds = getPopupBounds(popupItems);
  const passThrough = popupStyle.passThrough ?? true;
  const outsideTouchBehavior = passThrough
    ? "dismiss-and-pass-through"
    : "dismiss";
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
    <NativePopup
      onOutsidePress={handleOutsideTouch}
      outsideTouchBehavior={outsideTouchBehavior}
      style={{
        position: "absolute",
        left: -viewOffset.x,
        top: -viewOffset.y,
        width: overlayWidth,
        height: overlayHeight,
      }}
      visible={true}
    >
      <View
        style={{
          position: "absolute",
          left: viewOffset.x + popupBounds.x,
          top: viewOffset.y + popupBounds.y,
          width: popupBounds.width,
          height: popupBounds.height,
        }}
      >
        {popupItems.map(({ data, frame }, index) => (
          <View
            key={index}
            style={{
              position: "absolute",
              left: frame.x - popupBounds.x,
              top: frame.y - popupBounds.y,
              width: frame.width,
              height: frame.height,
            }}
          >
            {renderPopup(data)}
          </View>
        ))}
      </View>
    </NativePopup>
  );
}
