import React from 'react';
import { Modal, View } from 'react-native';

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

export default function Popup<T>({
  popupData,
  totalWidth,
  totalHeight,
  touchHandler,
  onTouchOutside,
  popupStyle,
  viewOffset,
}: PopupProps<T>) {
  return (
    <>
      {popupData && popupStyle?.renderPopup && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={true}
          onRequestClose={() => {
            onTouchOutside?.();
          }}
          onTouchStart={(e) => {
            console.log('modal touched ');
          }}
        >
          <View
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
            }}
            onTouchStart={(e) => {
              const x = e.nativeEvent.pageX;
              const y = e.nativeEvent.pageY;
              touchHandler?.(x - viewOffset.x, y - viewOffset.y);
            }}
          >
            {popupData && !Array.isArray(popupData) && (
              <View
                style={[
                  {
                    position: 'absolute',
                    left: Math.max(
                      0,
                      Math.min(popupData.x, totalWidth - (popupStyle?.width ?? 0)) +
                        viewOffset.x
                    ),
                    top: Math.max(
                      0,
                      Math.min(
                        popupData.y,
                        totalHeight - (popupStyle?.height ?? 0)
                      ) + viewOffset.y
                    ),
                  },
                ]}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {popupStyle?.renderPopup(popupData.data)}
              </View>
            )}

            {popupData &&
              Array.isArray(popupData) &&
              popupData.map((popupItem, index) => 
               (
                  <View
                    key={index}
                    style={[
                      {
                        position: 'absolute',
                        left: Math.max(
                          0,
                          Math.min(
                            popupItem.x,
                            totalWidth - (popupStyle?.width ?? 0)
                          ) + viewOffset.x
                        ),
                        top: Math.max(
                          0,
                          Math.min(
                            popupItem.y,
                            totalHeight - (popupStyle?.height ?? 0)
                          ) + viewOffset.y
                        ),
                      },
                    ]}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {popupStyle?.renderPopup?.(popupItem.data)}
                  </View>
                )
              )}
          </View>
        </Modal>
      )}
    </>
  );
}
