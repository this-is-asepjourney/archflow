import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/** Download a file from an authenticated API endpoint */
export async function downloadFile(url: string, filename: string) {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data as BlobPart], { type: (response.headers['content-type'] as string) || 'application/octet-stream' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

export async function uploadComponentIcon(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/components/upload-icon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function createComponent(data: Record<string, unknown>) {
  return api.post('/components', data);
}

export async function getComponents(workspaceId?: string) {
  return api.get('/components', { params: { workspaceId } });
}

export async function updateComponent(id: string, data: Record<string, unknown>) {
  return api.patch(`/components/${id}`, data);
}

export async function deleteComponent(id: string) {
  return api.delete(`/components/${id}`);
}

export default api;
