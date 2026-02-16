export interface ServiceFieldOption {
  label: string;
  value: string;
}

export interface ServiceField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "multi-select" | "boolean";
  options?: ServiceFieldOption[];
  placeholder?: string;
  required?: boolean;
}

export interface ServiceType {
  id: string;
  label: string;
  icon: string;
  fields: ServiceField[];
  promptInstructions: string;
}

export const serviceTypes: ServiceType[] = [
  {
    id: "pressure-washing",
    label: "Pressure Washing",
    icon: "💧",
    fields: [
      {
        name: "surfaces",
        label: "Surfaces",
        type: "multi-select",
        options: [
          { label: "Driveway", value: "driveway" },
          { label: "House Siding", value: "house-siding" },
          { label: "Patio/Deck", value: "patio-deck" },
          { label: "Roof", value: "roof" },
          { label: "Sidewalks", value: "sidewalks" },
        ],
      },
      {
        name: "approxSize",
        label: "Approx. Size",
        type: "text",
        placeholder: "e.g., 2000 sq ft",
      },
      {
        name: "stainTreatment",
        label: "Stain/Mold Treatment Needed",
        type: "boolean",
      },
    ],
    promptInstructions:
      "This is a pressure washing service. Emphasize thorough cleaning, restoration of surfaces, and protection. Mention specific surfaces being cleaned. If stain/mold treatment is selected, highlight that specialized treatment will be applied.",
  },
  {
    id: "landscaping",
    label: "Landscaping",
    icon: "🌿",
    fields: [
      {
        name: "services",
        label: "Services",
        type: "multi-select",
        options: [
          { label: "Mowing", value: "mowing" },
          { label: "Mulch", value: "mulch" },
          { label: "Yard Cleanup", value: "yard-cleanup" },
          { label: "Hedge Trimming", value: "hedge-trimming" },
          { label: "Weeding", value: "weeding" },
        ],
      },
      {
        name: "frequency",
        label: "Frequency",
        type: "select",
        options: [
          { label: "One-time", value: "one-time" },
          { label: "Weekly", value: "weekly" },
          { label: "Biweekly", value: "biweekly" },
          { label: "Monthly", value: "monthly" },
        ],
      },
      {
        name: "debrisHaulAway",
        label: "Debris Haul-Away",
        type: "boolean",
      },
    ],
    promptInstructions:
      "This is a landscaping service. Emphasize curb appeal, property value, and professional care. Mention the specific services being performed and frequency if recurring.",
  },
  {
    id: "cleaning",
    label: "Cleaning",
    icon: "✨",
    fields: [
      {
        name: "cleaningType",
        label: "Cleaning Type",
        type: "select",
        options: [
          { label: "Standard", value: "standard" },
          { label: "Deep Clean", value: "deep" },
          { label: "Move-in/Move-out", value: "move-in-out" },
        ],
      },
      {
        name: "bedrooms",
        label: "Bedrooms",
        type: "number",
        placeholder: "Number of bedrooms",
      },
      {
        name: "bathrooms",
        label: "Bathrooms",
        type: "number",
        placeholder: "Number of bathrooms",
      },
      {
        name: "pets",
        label: "Pets in Home",
        type: "boolean",
      },
    ],
    promptInstructions:
      "This is a cleaning service. Emphasize attention to detail, cleanliness standards, and a fresh living space. Mention the cleaning type and property details.",
  },
];

export const toneOptions = [
  { value: "standard", label: "Standard", description: "Professional and clear" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "premium", label: "Premium", description: "Polished, high-end professional" },
  { value: "luxury", label: "Luxury", description: "Elite, refined, white-glove service" },
];
