export type AppVisibility = "public" | "private" | "draft";

export interface ApplicationRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  visibility: AppVisibility;
  featured: boolean;
}
