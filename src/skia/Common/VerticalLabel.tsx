import { Canvas, Line, Text, Skia } from '@shopify/react-native-skia';
import { getFont, type CommonStyle } from '../common';

interface VerticalLabelStyles extends CommonStyle {
  width: number;
  height: number;
  strokeWidth?: number;
  strokeColor?: string;
  textColor?: string;
}

interface VerticalLabelProps {
  minValue: number;
  maxValue: number;
  labelCount: number;
  styles: VerticalLabelStyles;
}

function VerticalLabel({
  minValue,
  maxValue,
  labelCount,
  styles,
}: VerticalLabelProps) {
  const {
    width,
    height,
    strokeWidth = 2,
    strokeColor = 'white',
    textColor = 'white',
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    fontSize = 12,
    backgroundColor,
  } = styles;

  // Generate evenly spaced values
  const stepValue =
    labelCount > 1 ? (maxValue - minValue) / (labelCount - 1) : 0;
  const labels = Array.from(
    { length: labelCount },
    (_, i) => minValue + i * stepValue
  );

  const font = getFont(fontSize);

  const usableHeight = height - paddingTop - paddingBottom - fontSize;
  const stepY = labelCount > 1 ? usableHeight / (labelCount - 1) : 0;

  // Precompute text paint
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(textColor));

  return (
    <Canvas style={{ width, height, backgroundColor }}>
      <Line
        p1={{ x: width - paddingRight - strokeWidth / 2, y: paddingTop }}
        p2={{
          x: width - paddingRight - strokeWidth / 2,
          y: height - paddingBottom,
        }}
        color={strokeColor}
        strokeWidth={strokeWidth}
      />

      {labels.map((label, i) => {
        const y = height - paddingBottom - stepY * i;
        const text = label.toFixed(0);

        // measure text width for right-align
        const textWidth = font.measureText(text).width;
        const x = width - paddingRight - strokeWidth - 4 - textWidth;

        return (
          <Text
            key={i}
            x={x}
            y={y}
            text={text}
            font={font}
            color={textColor}
          />
        );
      })}
    </Canvas>
  );
}

export default VerticalLabel;
