import { UserProfile } from '../types';
import { EnterpriseAppData } from './storage';

const BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }
  if (!res.ok || body?.success === false) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

/** The subset of EnterpriseAppData that lives server-side (everything but currentUser). */
export type WorkspaceData = Omit<EnterpriseAppData, 'currentUser'>;

export interface AuthResponse {
  success: true;
  user: UserProfile;
  workspace: WorkspaceData;
}

export function signup(input: {
  companyName: string;
  industry?: string;
  currency?: string;
  adminName: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
}

export function login(input: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export function logout() {
  return request<{ success: true }>('/auth/logout', { method: 'POST' });
}

/** Returns null (instead of throwing) when there is no active session — used for silent session checks on load. */
export async function getSession(): Promise<AuthResponse | null> {
  try {
    return await request<AuthResponse>('/auth/me', { method: 'GET' });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 404)) return null;
    throw e;
  }
}

export function getWorkspace() {
  return request<{ success: true; workspace: WorkspaceData }>('/workspace', { method: 'GET' });
}

export function saveWorkspace(workspace: WorkspaceData) {
  return request<{ success: true; workspace: WorkspaceData }>('/workspace', {
    method: 'PUT',
    body: JSON.stringify({ workspace }),
  });
}

export function listTeam() {
  return request<{ success: true; users: UserProfile[] }>('/team', { method: 'GET' });
}

export function addTeamMember(input: {
  name: string;
  email: string;
  role: string;
  password: string;
  departmentId?: string;
  departmentName?: string;
}) {
  return request<{ success: true; user: UserProfile }>('/team', { method: 'POST', body: JSON.stringify(input) });
}

export function removeTeamMember(userId: string) {
  return request<{ success: true }>(`/team/${userId}`, { method: 'DELETE' });
}
