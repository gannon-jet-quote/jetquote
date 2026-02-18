import { Label } from "@/components/ui/label";

function hexToRgb(hex: string): number[] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function makeColor(name: string, hex: string) {
  return { name, hex, rgb: hexToRgb(hex) };
}

const PRESET_COLORS = [
  // Row 1 — Neutrals
  makeColor("Black", "#000000"),
  makeColor("Dark Charcoal", "#1a1a1a"),
  makeColor("Charcoal", "#333333"),
  makeColor("Dark Gray", "#4d4d4d"),
  makeColor("Gray", "#666666"),
  makeColor("Med Gray", "#808080"),
  makeColor("Silver", "#999999"),
  makeColor("Light Silver", "#b3b3b3"),
  makeColor("Light Gray", "#cccccc"),
  makeColor("Pale Gray", "#e6e6e6"),
  makeColor("White", "#ffffff"),
  // Row 2 — Reds
  makeColor("Dark Maroon", "#330000"),
  makeColor("Maroon", "#660000"),
  makeColor("Dark Red", "#990000"),
  makeColor("Red", "#cc0000"),
  makeColor("Bright Red", "#ff0000"),
  makeColor("Light Red", "#ff4d4d"),
  makeColor("Salmon", "#ff9999"),
  // Row 3 — Oranges
  makeColor("Brown", "#663300"),
  makeColor("Dark Orange", "#994d00"),
  makeColor("Orange", "#cc6600"),
  makeColor("Bright Orange", "#ff8000"),
  makeColor("Light Orange", "#ffaa4d"),
  makeColor("Peach", "#ffcc99"),
  makeColor("Pale Peach", "#ffe6cc"),
  // Row 4 — Yellows
  makeColor("Dark Gold", "#665200"),
  makeColor("Gold", "#997a00"),
  makeColor("Dark Yellow", "#cca300"),
  makeColor("Yellow", "#ffcc00"),
  makeColor("Bright Yellow", "#ffdd4d"),
  makeColor("Light Yellow", "#ffee99"),
  makeColor("Pale Yellow", "#fff5cc"),
  // Row 5 — Greens
  makeColor("Dark Green", "#003300"),
  makeColor("Forest", "#006600"),
  makeColor("Green", "#009900"),
  makeColor("Bright Green", "#00cc00"),
  makeColor("Lime", "#33ff33"),
  makeColor("Light Green", "#80ff80"),
  makeColor("Pale Green", "#ccffcc"),
  // Row 6 — Teals / Cyans
  makeColor("Dark Teal", "#003333"),
  makeColor("Teal", "#006666"),
  makeColor("Dark Cyan", "#009999"),
  makeColor("Cyan", "#00cccc"),
  makeColor("Bright Cyan", "#33ffff"),
  makeColor("Light Cyan", "#99ffff"),
  makeColor("Pale Cyan", "#ccffff"),
  // Row 7 — Blues
  makeColor("Navy", "#000033"),
  makeColor("Dark Navy", "#000066"),
  makeColor("Dark Blue", "#000099"),
  makeColor("Blue", "#0000cc"),
  makeColor("Bright Blue", "#3366ff"),
  makeColor("Light Blue", "#6699ff"),
  makeColor("Pale Blue", "#99ccff"),
  // Row 8 — Purples
  makeColor("Dark Purple", "#1a0033"),
  makeColor("Purple", "#4d0099"),
  makeColor("Violet", "#7733ff"),
  makeColor("Bright Purple", "#9966ff"),
  makeColor("Lavender", "#bb99ff"),
  makeColor("Pale Lavender", "#ddccff"),
  // Row 9 — Pinks / Magentas
  makeColor("Dark Magenta", "#660033"),
  makeColor("Magenta", "#cc0066"),
  makeColor("Hot Pink", "#ff3399"),
  makeColor("Pink", "#ff66b2"),
  makeColor("Light Pink", "#ff99cc"),
  makeColor("Pale Pink", "#ffcce6"),
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
  const isLight = color.rgb[0] + color.rgb[1] + color.rgb[2] > 500;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-6 w-6 rounded-full border-2 transition-all ${
        selected
          ? "border-primary ring-2 ring-primary/30 scale-125 z-10"
          : "border-border/40 hover:border-primary/40 hover:scale-110"
      }`}
      style={{ backgroundColor: color.hex }}
      title={color.name}
    >
      {selected && (
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold drop-shadow ${isLight ? "text-gray-800" : "text-white"}`}>
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
      <div className="grid grid-cols-7 sm:grid-cols-11 gap-1.5">
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
