import { ApiResponse } from '@instagrambot/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit & { workspaceId?: string } = {}
): Promise<T> {
  const { workspaceId, ...customOptions } = options;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
    ...(customOptions.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...customOptions,
    headers,
    credentials: 'include', // Include httpOnly cookies
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: 'Geçersiz sunucu yanıtı' },
  }));

  if (!response.ok || !data.success) {
    const message = data.error?.message || `İstek başarısız (${response.status})`;
    throw new Error(message);
  }

  return data.data as T;
}
