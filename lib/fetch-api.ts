/**
 * Helper for API calls that works in both web and mobile
 * In mobile (Capacitor), it uses the remote server URL
 * In web, it uses relative URLs
 */
import { apiUrl } from './api-config';

/**
 * Fetch wrapper that automatically handles API URLs for mobile and web
 */
export async function fetchApi(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = apiUrl(path);
  return fetch(url, options);
}

/**
 * Get the full API URL for a path
 */
export function getApiUrl(path: string): string {
  return apiUrl(path);
}

