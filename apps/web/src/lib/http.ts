import { ApiFetchOptions } from '@/types';
import { ABSOLUTE_URL_PATTERN } from '@/constants';

const getRequestUrl = (path: string, baseUrl: string) => {
  return ABSOLUTE_URL_PATTERN.test(path) ? path : `${baseUrl}${path}`;
};

export const http = async <T>(
  path: string,
  { baseUrl = '', headers, token, ...init }: ApiFetchOptions = {
    baseUrl: '',
  },
): Promise<T> => {
  const requestHeaders = new Headers(headers);
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }
  if (init.body != null && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(getRequestUrl(path, baseUrl), {
    ...init,
    headers: requestHeaders,
  });

  const contentType = response.headers.get('content-type');
  const body = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw body;
  }

  return body as T;
};
