---
name: Service catalog extensibility
description: Service types are data-driven with category, fields, defaultScopeBullets, optionalAddons — add new services by editing config only
type: feature
---
Service catalog lives in `src/config/serviceTypes.ts`. Each `ServiceType` has:
- `id`, `label`, `icon`, `category` (used for grouped dropdowns)
- `fields` (conditional form fields rendered by ConditionalFields component)
- `defaultScopeBullets` (passed to AI as scope-of-work starting points)
- `optionalAddons` (future use for upsell suggestions)
- `promptInstructions` (AI system prompt context per service)

Categories: Exterior, Lawn & Garden, Interior, General.

11 services total: Pressure Washing, Window Cleaning, Gutter Cleaning, Landscaping, Pool Service, Cleaning, Pest Control, Appliance Repair, Junk Removal, Mobile Car Detailing, Handyman.

`getServicesByCategory()` helper groups services for dropdown rendering.
