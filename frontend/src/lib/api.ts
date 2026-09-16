const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  // Anti-CSRF header
  headers.set('X-Requested-With', 'XMLHttpRequest');

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for sending/receiving cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error?.message || 'Something went wrong', response.status);
  }

  return data.data;
};
