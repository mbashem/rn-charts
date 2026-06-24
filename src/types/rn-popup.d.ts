declare module "@bashem/rn-popup" {
  import type * as React from "react";
  import type { StyleProp, ViewStyle } from "react-native";

  export type OutsideTouchBehavior =
    | "none"
    | "dismiss"
    | "pass-through"
    | "dismiss-and-pass-through";

  export interface PopupProps {
    visible: boolean;
    children: React.ReactNode;
    outsideTouchBehavior?: OutsideTouchBehavior;
    onOutsidePress?: () => void;
    onDismiss?: () => void;
    style?: StyleProp<ViewStyle>;
  }

  export const Popup: React.ComponentType<PopupProps>;
}
