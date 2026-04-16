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
  category: string;
  fields: ServiceField[];
  defaultScopeBullets: string[];
  optionalAddons: string[];
  promptInstructions: string;
}

export const serviceTypes: ServiceType[] = [
  // ── Exterior ──
  {
    id: "pressure-washing",
    label: "Pressure Washing",
    icon: "💧",
    category: "Exterior",
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
      { name: "approxSize", label: "Approx. Size", type: "text", placeholder: "e.g., 2000 sq ft" },
      { name: "stainTreatment", label: "Stain/Mold Treatment Needed", type: "boolean" },
    ],
    defaultScopeBullets: [
      "High-pressure surface cleaning of specified areas",
      "Pre-treatment of stains, mold, and mildew as needed",
      "Post-wash inspection and touch-up",
    ],
    optionalAddons: ["Sealing/coating application", "Gutter brightening", "Fence cleaning"],
    promptInstructions:
      "This is a pressure washing service. Emphasize thorough cleaning, restoration of surfaces, and protection. Mention specific surfaces being cleaned. If stain/mold treatment is selected, highlight that specialized treatment will be applied.",
  },
  {
    id: "window-cleaning",
    label: "Window Cleaning",
    icon: "🪟",
    category: "Exterior",
    fields: [
      {
        name: "windowType",
        label: "Window Types",
        type: "multi-select",
        options: [
          { label: "Interior", value: "interior" },
          { label: "Exterior", value: "exterior" },
          { label: "Skylights", value: "skylights" },
          { label: "Storm Windows", value: "storm-windows" },
        ],
      },
      { name: "stories", label: "Number of Stories", type: "number", placeholder: "e.g., 2" },
      { name: "screenCleaning", label: "Screen Cleaning", type: "boolean" },
    ],
    defaultScopeBullets: [
      "Streak-free cleaning of all specified windows",
      "Sill and frame wipe-down",
      "Inspection for damaged seals or screens",
    ],
    optionalAddons: ["Screen repair", "Hard water stain removal", "Track cleaning"],
    promptInstructions:
      "This is a window cleaning service. Emphasize crystal-clear, streak-free results. Mention interior/exterior scope and any special window types.",
  },
  {
    id: "gutter-cleaning",
    label: "Gutter Cleaning",
    icon: "🏠",
    category: "Exterior",
    fields: [
      { name: "linearFeet", label: "Approx. Linear Feet", type: "text", placeholder: "e.g., 150 ft" },
      { name: "stories", label: "Number of Stories", type: "number", placeholder: "e.g., 2" },
      { name: "downspoutFlush", label: "Downspout Flush Included", type: "boolean" },
    ],
    defaultScopeBullets: [
      "Remove all debris from gutters",
      "Flush downspouts to ensure proper drainage",
      "Visual inspection for leaks and loose brackets",
    ],
    optionalAddons: ["Gutter guard installation", "Minor gutter repair", "Gutter brightening"],
    promptInstructions:
      "This is a gutter cleaning service. Emphasize proper drainage, water damage prevention, and roof/foundation protection.",
  },
  // ── Lawn & Garden ──
  {
    id: "landscaping",
    label: "Landscaping",
    icon: "🌿",
    category: "Lawn & Garden",
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
      { name: "debrisHaulAway", label: "Debris Haul-Away", type: "boolean" },
    ],
    defaultScopeBullets: [
      "Professional lawn and landscape maintenance",
      "Trimming, edging, and cleanup of all specified areas",
      "Debris removal and site cleanup upon completion",
    ],
    optionalAddons: ["Fertilization", "Aeration", "Sod installation", "Irrigation check"],
    promptInstructions:
      "This is a landscaping service. Emphasize curb appeal, property value, and professional care. Mention the specific services being performed and frequency if recurring.",
  },
  {
    id: "pool-service",
    label: "Pool Service / Pool Cleaning",
    icon: "🏊",
    category: "Lawn & Garden",
    fields: [
      {
        name: "poolType",
        label: "Pool Type",
        type: "select",
        options: [
          { label: "In-Ground", value: "in-ground" },
          { label: "Above-Ground", value: "above-ground" },
          { label: "Hot Tub / Spa", value: "hot-tub" },
        ],
      },
      {
        name: "services",
        label: "Services",
        type: "multi-select",
        options: [
          { label: "Chemical Balancing", value: "chemical-balancing" },
          { label: "Skimming & Vacuuming", value: "skimming-vacuuming" },
          { label: "Filter Cleaning", value: "filter-cleaning" },
          { label: "Tile / Surface Cleaning", value: "tile-cleaning" },
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
    ],
    defaultScopeBullets: [
      "Water chemistry testing and chemical balancing",
      "Skimming, vacuuming, and brushing of pool surfaces",
      "Filter inspection and cleaning",
    ],
    optionalAddons: ["Pool opening/closing", "Equipment repair", "Acid wash", "Leak detection"],
    promptInstructions:
      "This is a pool service. Emphasize water safety, cleanliness, and equipment longevity. Mention pool type and specific services.",
  },
  // ── Interior ──
  {
    id: "cleaning",
    label: "Cleaning",
    icon: "✨",
    category: "Interior",
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
      { name: "bedrooms", label: "Bedrooms", type: "number", placeholder: "Number of bedrooms" },
      { name: "bathrooms", label: "Bathrooms", type: "number", placeholder: "Number of bathrooms" },
      { name: "pets", label: "Pets in Home", type: "boolean" },
    ],
    defaultScopeBullets: [
      "Thorough cleaning of all rooms, surfaces, and fixtures",
      "Kitchen and bathroom deep sanitization",
      "Vacuuming, mopping, and dusting throughout",
    ],
    optionalAddons: ["Inside oven cleaning", "Inside refrigerator cleaning", "Laundry service", "Organizing"],
    promptInstructions:
      "This is a cleaning service. Emphasize attention to detail, cleanliness standards, and a fresh living space. Mention the cleaning type and property details.",
  },
  {
    id: "pest-control",
    label: "Pest Control",
    icon: "🐛",
    category: "Interior",
    fields: [
      {
        name: "pestType",
        label: "Pest Type",
        type: "multi-select",
        options: [
          { label: "Ants", value: "ants" },
          { label: "Roaches", value: "roaches" },
          { label: "Spiders", value: "spiders" },
          { label: "Rodents", value: "rodents" },
          { label: "Termites", value: "termites" },
          { label: "Mosquitoes", value: "mosquitoes" },
          { label: "Bed Bugs", value: "bed-bugs" },
        ],
      },
      {
        name: "treatmentArea",
        label: "Treatment Area",
        type: "select",
        options: [
          { label: "Interior Only", value: "interior" },
          { label: "Exterior Only", value: "exterior" },
          { label: "Interior & Exterior", value: "both" },
        ],
      },
      { name: "recurring", label: "Recurring Treatment Plan", type: "boolean" },
    ],
    defaultScopeBullets: [
      "Inspection of property for pest activity and entry points",
      "Targeted treatment of affected areas",
      "Follow-up recommendations and prevention tips",
    ],
    optionalAddons: ["Quarterly maintenance plan", "Exclusion/sealing work", "Attic/crawl space treatment"],
    promptInstructions:
      "This is a pest control service. Emphasize safety, thoroughness, and long-term prevention. Mention specific pests targeted and treatment areas.",
  },
  {
    id: "appliance-repair",
    label: "Appliance Repair",
    icon: "🔧",
    category: "Interior",
    fields: [
      {
        name: "applianceType",
        label: "Appliance",
        type: "select",
        options: [
          { label: "Washer", value: "washer" },
          { label: "Dryer", value: "dryer" },
          { label: "Refrigerator", value: "refrigerator" },
          { label: "Dishwasher", value: "dishwasher" },
          { label: "Oven/Range", value: "oven-range" },
          { label: "Microwave", value: "microwave" },
          { label: "HVAC Unit", value: "hvac" },
          { label: "Other", value: "other" },
        ],
      },
      { name: "brand", label: "Brand / Model", type: "text", placeholder: "e.g., Samsung RF28R7351SR" },
      { name: "issueDescription", label: "Describe the Issue", type: "text", placeholder: "e.g., not cooling, leaking water" },
    ],
    defaultScopeBullets: [
      "Diagnostic inspection of the appliance",
      "Repair or replacement of faulty components",
      "Post-repair testing and verification",
    ],
    optionalAddons: ["Extended warranty", "Preventive maintenance tune-up", "Parts rush order"],
    promptInstructions:
      "This is an appliance repair service. Emphasize expertise, reliability, and quick turnaround. Mention the specific appliance and issue.",
  },
  // ── General ──
  {
    id: "junk-removal",
    label: "Junk Removal",
    icon: "🚛",
    category: "General",
    fields: [
      {
        name: "loadSize",
        label: "Estimated Load Size",
        type: "select",
        options: [
          { label: "Small (pickup truck)", value: "small" },
          { label: "Medium (half trailer)", value: "medium" },
          { label: "Large (full trailer)", value: "large" },
        ],
      },
      {
        name: "itemTypes",
        label: "Item Types",
        type: "multi-select",
        options: [
          { label: "Furniture", value: "furniture" },
          { label: "Appliances", value: "appliances" },
          { label: "Yard Waste", value: "yard-waste" },
          { label: "Construction Debris", value: "construction-debris" },
          { label: "Electronics", value: "electronics" },
          { label: "General Household", value: "general" },
        ],
      },
      { name: "stairsInvolved", label: "Stairs Involved", type: "boolean" },
    ],
    defaultScopeBullets: [
      "On-site pickup of all specified items",
      "Loading, hauling, and responsible disposal/recycling",
      "Sweep and clean-up of work area after removal",
    ],
    optionalAddons: ["Donation drop-off", "Same-day service", "Dumpster rental"],
    promptInstructions:
      "This is a junk removal service. Emphasize convenience, eco-friendly disposal, and a clutter-free space. Mention load size and item types.",
  },
  {
    id: "mobile-car-detailing",
    label: "Mobile Car Detailing",
    icon: "🚗",
    category: "General",
    fields: [
      {
        name: "vehicleType",
        label: "Vehicle Type",
        type: "select",
        options: [
          { label: "Sedan / Coupe", value: "sedan" },
          { label: "SUV / Crossover", value: "suv" },
          { label: "Truck", value: "truck" },
          { label: "Van / Minivan", value: "van" },
        ],
      },
      {
        name: "detailLevel",
        label: "Detail Level",
        type: "select",
        options: [
          { label: "Exterior Only", value: "exterior" },
          { label: "Interior Only", value: "interior" },
          { label: "Full Detail (Interior + Exterior)", value: "full" },
        ],
      },
      { name: "numberOfVehicles", label: "Number of Vehicles", type: "number", placeholder: "1" },
    ],
    defaultScopeBullets: [
      "Hand wash and dry of vehicle exterior",
      "Interior vacuuming, wipe-down, and glass cleaning",
      "Tire and wheel cleaning and dressing",
    ],
    optionalAddons: ["Ceramic coating", "Paint correction / polish", "Engine bay cleaning", "Headlight restoration"],
    promptInstructions:
      "This is a mobile car detailing service. Emphasize convenience (we come to you), attention to detail, and showroom results. Mention vehicle type and detail level.",
  },
  {
    id: "handyman",
    label: "Handyman / Small Repairs",
    icon: "🛠️",
    category: "General",
    fields: [
      {
        name: "repairType",
        label: "Type of Work",
        type: "multi-select",
        options: [
          { label: "Drywall Repair", value: "drywall" },
          { label: "Plumbing Fix", value: "plumbing" },
          { label: "Electrical (minor)", value: "electrical" },
          { label: "Furniture Assembly", value: "furniture-assembly" },
          { label: "Door/Window Repair", value: "door-window" },
          { label: "Painting / Touch-up", value: "painting" },
          { label: "Other", value: "other" },
        ],
      },
      { name: "estimatedHours", label: "Estimated Hours", type: "number", placeholder: "e.g., 3" },
    ],
    defaultScopeBullets: [
      "On-site assessment and repair of specified items",
      "All necessary materials and tools provided",
      "Clean-up of work area upon completion",
    ],
    optionalAddons: ["Additional hourly work", "Material sourcing", "Emergency / same-day service"],
    promptInstructions:
      "This is a handyman / small repairs service. Emphasize versatility, reliability, and quality workmanship. Mention the specific types of repairs.",
  },
];

export const toneOptions = [
  { value: "standard", label: "Standard", description: "Professional and clear" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "premium", label: "Premium", description: "Polished, high-end professional" },
  { value: "luxury", label: "Luxury", description: "Elite, refined, white-glove service" },
];

/** Helper: get services grouped by category for dropdown rendering */
export const getServicesByCategory = (): Record<string, ServiceType[]> => {
  const grouped: Record<string, ServiceType[]> = {};
  for (const s of serviceTypes) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  return grouped;
};
