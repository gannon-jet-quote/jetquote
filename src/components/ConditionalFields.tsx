import { ServiceField } from "@/config/serviceTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  fields: ServiceField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const ConditionalFields = ({ fields, values, onChange }: Props) => {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          {field.type === "text" && (
            <div className="space-y-2">
              <Label className="text-secondary-foreground">{field.label}</Label>
              <Input
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring"
              />
            </div>
          )}

          {field.type === "number" && (
            <div className="space-y-2">
              <Label className="text-secondary-foreground">{field.label}</Label>
              <Input
                type="number"
                min={0}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-ring"
              />
            </div>
          )}

          {field.type === "select" && (
            <div className="space-y-2">
              <Label className="text-secondary-foreground">{field.label}</Label>
              <Select
                value={values[field.name] || ""}
                onValueChange={(v) => onChange(field.name, v)}
              >
                <SelectTrigger className="border-border bg-input text-foreground">
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {field.type === "multi-select" && (
            <div className="space-y-3">
              <Label className="text-secondary-foreground">{field.label}</Label>
              <div className="flex flex-wrap gap-3">
                {field.options?.map((opt) => {
                  const selected: string[] = values[field.name] || [];
                  const isChecked = selected.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent data-[checked=true]:border-primary/50 data-[checked=true]:bg-primary/10"
                      data-checked={isChecked}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...selected, opt.value]
                            : selected.filter((v: string) => v !== opt.value);
                          onChange(field.name, next);
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {field.type === "boolean" && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-input p-3">
              <Label className="text-secondary-foreground">{field.label}</Label>
              <Switch
                checked={values[field.name] || false}
                onCheckedChange={(v) => onChange(field.name, v)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConditionalFields;
