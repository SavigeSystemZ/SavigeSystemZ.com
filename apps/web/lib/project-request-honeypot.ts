/**
 * Hidden "website" field on public forms — bots often fill it; humans should not.
 */
export function isProjectRequestHoneypotTripped(website: string | undefined): boolean {
  return Boolean(website?.trim());
}
