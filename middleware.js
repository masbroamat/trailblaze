export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
};

export default function middleware(request) {
  const url = new URL(request.url);

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

  const newUrl = new URL(url.pathname, backendUrl);

  newUrl.search = url.search;

  return fetch(newUrl, {
    headers: request.headers,
    method: request.method,
    body: request.body,
  });
}
