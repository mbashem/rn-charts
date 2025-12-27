import React from 'react';
import { Modal, View } from 'react-native';

interface PopupProps<T> {
  popupData?: {
    x: number;
    y: number;
    data: T;
  };
  popupDimension: {
    width: number;
    height: number;
  };
  totalWidth: number;
  totalHeight: number;
  touchHandler?: (x: number, y: number) => void;
  onTouchOutside?: () => void;
  renderPopup?: (data: T) => React.ReactNode;
  viewOffset: {
    x: number;
    y: number;
  };
}

export default function Popup<T>({
  popupData,
  popupDimension,
  totalWidth,
  totalHeight,
  touchHandler,
  onTouchOutside,
  renderPopup,
  viewOffset,
}: PopupProps<T>) {
  return (
    <>
      {popupData && renderPopup && (
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
            {popupData && (
              <View
                style={[
                  {
                    position: 'absolute',
                    left: Math.max(
                      0,
                      Math.min(popupData.x, totalWidth - popupDimension.width) +
                        viewOffset.x
                    ),
                    top: Math.max(
                      0,
                      Math.min(
                        popupData.y,
                        totalHeight - popupDimension.height
                      ) + viewOffset.y
                    ),
                  },
                ]}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {renderPopup(popupData.data)}
              </View>
            )}
          </View>
        </Modal>
      )}
    </>
  );
}
