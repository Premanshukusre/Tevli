import { fetchApi } from '../../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export const authApi = {
  login: (data: any) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (data: any) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  logout: () => fetchApi('/auth/logout', {
    method: 'POST'
  }),
  getMe: () => fetchApi('/auth/me')
    .then(res => res.user as User)
    .catch(() => null), // Treat any error (like 401) as an unauthenticated state (null)
  updateProfile: (data: any) => fetchApi('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  changePassword: (data: any) => fetchApi('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
