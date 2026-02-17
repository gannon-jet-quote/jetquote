import { useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Props {
  logoDataUrl: string | null;
  onLogoChange: (dataUrl: string | null) => void;
}

const LogoUpload = ({ logoDataUrl, onLogoChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-secondary-foreground">Company Logo Upload</Label>
      <p className="text-xs text-muted-foreground">
        For best results, upload a transparent PNG logo with the background removed.
      </p>

      {logoDataUrl ? (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-input p-3">
          <img
            src={logoDataUrl}
            alt="Company logo"
            className="h-10 max-w-[120px] object-contain"
          />
          <button
            type="button"
            onClick={() => {
              onLogoChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-input px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent"
        >
          <Upload className="h-4 w-4" />
          Click to upload logo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".png,.svg,.jpg,.jpeg"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
};

export default LogoUpload;
