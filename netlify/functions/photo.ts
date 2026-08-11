import { getStore } from '@netlify/blobs';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  try {
    const store = getStore('photobooth-uploads');
    const blob = await store.get(id, { type: 'blob' });
    const metadata = await store.getMetadata(id);
    const mimeType = metadata?.metadata?.mimeType || 'image/jpeg';

    if (!blob) {
      return new Response('Photo not found', { status: 404 });
    }

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Photo fetch error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
