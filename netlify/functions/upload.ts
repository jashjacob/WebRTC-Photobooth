import { getStore } from '@netlify/blobs';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await req.json();
    const { image } = data; // data:image/jpeg;base64,...

    if (!image || !image.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), { status: 400 });
    }

    const base64Data = image.split(',')[1];
    const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
    const buffer = Buffer.from(base64Data, 'base64');

    const id = crypto.randomUUID();
    const store = getStore('photobooth-uploads');

    await store.set(id, buffer, {
      metadata: { mimeType }
    });

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}/api/photo?id=${id}`;

    return new Response(JSON.stringify({ id, url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
