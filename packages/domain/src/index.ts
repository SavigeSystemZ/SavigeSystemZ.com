export type AppVisibility = "public" | "private" | "draft";

export interface ApplicationRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  visibility: AppVisibility;
  featured: boolean;
  label?: string;
  tagline?: string;
  audience?: string;
  priceLabel?: string;
  releaseChannel?: string;
  details?: string;
  highlights?: string[];
  surfaceAreas?: string[];
  stackItems?: string[];
}
