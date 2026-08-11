import { getStore } from '@netlify/blobs';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Basic authentication check
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== 'Bearer kawaii123') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const store = getStore('photobooth-uploads');
    const { blobs } = await store.list();

    // Group blobs by sessionId
    const sessions: Record<string, any> = {};

    for (const blob of blobs) {
      const parts = blob.key.split('/');
      // If it has a sessionId and fileName (e.g. uuid/shot-1)
      if (parts.length === 2) {
        const [sessionId, fileName] = parts;
        if (!sessions[sessionId]) {
          sessions[sessionId] = {
            id: sessionId,
            shots: {},
            filmstrip: null,
            timestamp: blob.metadata?.timestamp || 0
          };
        }

        const host = req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const url = `${protocol}://${host}/api/photo?id=${encodeURIComponent(blob.key)}`;

        if (fileName === 'filmstrip') {
          sessions[sessionId].filmstrip = url;
        } else if (fileName.startsWith('shot-')) {
          sessions[sessionId].shots[fileName] = url;
        }

        // Update session timestamp to the most recent upload
        if (blob.metadata?.timestamp && blob.metadata.timestamp > sessions[sessionId].timestamp) {
          sessions[sessionId].timestamp = blob.metadata.timestamp;
        }
      }
    }

    // Convert to sorted array (newest first)
    const sessionList = Object.values(sessions).sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify({ sessions: sessionList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
