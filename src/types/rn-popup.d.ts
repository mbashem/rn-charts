declare module '@bashem/rn-popup' {
  import type * as React from 'react';
  import type { NativeSyntheticEvent, ViewProps } from 'react-native';

  export interface OutsideTouchEvent {
    pageX: number;
    pageY: number;
  }

  export interface RnPopupViewProps extends ViewProps {
    color?: string;
    passThrough?: boolean;
    onOutsideTouch?: (
      event: NativeSyntheticEvent<OutsideTouchEvent>
    ) => void;
  }

  export const RnPopupView: React.ComponentType<RnPopupViewProps>;
}
