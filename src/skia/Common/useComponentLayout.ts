import { useCallback, useState } from "react";
import type { LayoutChangeEvent, LayoutRectangle } from "react-native";

function useComponentLayout(): [LayoutRectangle | undefined, (event: LayoutChangeEvent) => void] {
  const [size, setSize] = useState<LayoutRectangle | undefined>(undefined);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setSize(event.nativeEvent.layout);
  }, []);

  return [size, onLayout];
};

export default useComponentLayout;