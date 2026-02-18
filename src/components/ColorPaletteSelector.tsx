import { Label } from "@/components/ui/label";

const PRESET_COLORS = [
  { name: "Blue", hex: "#3B82F6", rgb: [59, 130, 246] },
  { name: "Navy", hex: "#1E3A5F", rgb: [30, 58, 95] },
  { name: "Green", hex: "#22C55E", rgb: [34, 197, 94] },
  { name: "Teal", hex: "#14B8A6", rgb: [20, 184, 166] },
  { name: "Purple", hex: "#8B5CF6", rgb: [139, 92, 246] },
  { name: "Orange", hex: "#F97316", rgb: [249, 115, 22] },
  { name: "Red", hex: "#EF4444", rgb: [239, 68, 68] },
  { name: "Gray", hex: "#6B7280", rgb: [107, 114, 128] },
  { name: "Black", hex: "#1F2937", rgb: [31, 41, 55] },
  { name: "Gold", hex: "#B49564", rgb: [180, 149, 100] },
] as const;

export type ColorChoice = { name: string; hex: string; rgb: number[] };

interface Props {
  tone: string;
  primaryColor: ColorChoice | null;
  secondaryColor: ColorChoice | null;
  tertiaryColor?: ColorChoice | null;
  onPrimaryChange: (color: ColorChoice | null) => void;
  onSecondaryChange: (color: ColorChoice | null) => void;
  onTertiaryChange?: (color: ColorChoice | null) => void;
}

function Swatch({
  color,
  selected,
  onClick,
}: {
  color: (typeof PRESET_COLORS)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-8 w-8 rounded-full border-2 transition-all ${
        selected
          ? "border-primary ring-2 ring-primary/30 scale-110"
          : "border-border hover:border-primary/40 hover:scale-105"
      }`}
      style={{ backgroundColor: color.hex }}
      title={color.name}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
          ✓
        </span>
      )}
    </button>
  );
}

function PaletteRow({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: ColorChoice | null;
  onChange: (c: ColorChoice | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-secondary-foreground text-xs">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <Swatch
            key={c.name}
            color={c}
            selected={selected?.name === c.name}
            onClick={() =>
              onChange(selected?.name === c.name ? null : { name: c.name, hex: c.hex, rgb: [...c.rgb] })
            }
          />
        ))}
      </div>
    </div>
  );
}

const ColorPaletteSelector = ({
  tone,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  onPrimaryChange,
  onSecondaryChange,
  onTertiaryChange,
}: Props) => {
  if (tone === "standard") return null;

  if (tone === "friendly") {
    return (
      <div className="space-y-3">
        <Label className="text-secondary-foreground">Accent Color</Label>
        <p className="text-xs text-muted-foreground">
          Choose a color for section headers and accents.
        </p>
        <PaletteRow label="Accent Color" selected={primaryColor} onChange={onPrimaryChange} />
      </div>
    );
  }

  // premium or luxury
  return (
    <div className="space-y-4">
      <Label className="text-secondary-foreground">Brand Colors</Label>
      <p className="text-xs text-muted-foreground">
        Choose a primary color for the header and a secondary for accents.
      </p>
      <PaletteRow label="Primary (Header)" selected={primaryColor} onChange={onPrimaryChange} />
      <PaletteRow label="Secondary (Accents)" selected={secondaryColor} onChange={onSecondaryChange} />
      {tone === "luxury" && onTertiaryChange && (
        <div className="space-y-2">
          <Label className="text-secondary-foreground text-sm">Luxury Header Text Color (Optional)</Label>
          <p className="text-xs text-muted-foreground">
            Used for the header text only (e.g., gold accent).
          </p>
          <PaletteRow label="Header Text" selected={tertiaryColor ?? null} onChange={onTertiaryChange} />
        </div>
      )}
    </div>
  );
};

export { PRESET_COLORS };
export default ColorPaletteSelector;
