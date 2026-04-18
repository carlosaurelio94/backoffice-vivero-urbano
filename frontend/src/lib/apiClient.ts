/**
 * Cliente HTTP para el backend Spring Boot.
 * Usarlo cuando se necesite lógica de negocio compleja que no
 * conviene hacer directo en Supabase (reportes, integraciones, etc.)
 *
 * Por ahora el frontend usa Supabase directamente para las operaciones CRUD.
 * Este cliente queda disponible para migrar endpoints gradualmente.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(path: string)                      => request<T>(path),
  post:   <T>(path: string, body: unknown)       => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)       => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                      => request<T>(path, { method: 'DELETE' }),
};
