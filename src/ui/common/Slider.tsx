import * as SliderPrimitive from "@radix-ui/react-slider";
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onReset,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="setting-slider" onDoubleClick={onReset}>
      <div className="setting-heading">
        <span>{label}</span>
        <output>
          {step >= 1
            ? value.toLocaleString("en-US")
            : value.toFixed(step < 0.01 ? 3 : 2)}
        </output>
      </div>
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => {
          if (values[0] !== undefined) onChange(values[0]);
        }}
      >
        <SliderPrimitive.Track className="slider-track">
          <SliderPrimitive.Range className="slider-range" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="slider-thumb" aria-label={label} />
      </SliderPrimitive.Root>
    </div>
  );
}
