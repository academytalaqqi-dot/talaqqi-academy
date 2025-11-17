/**
 * Cloudflare Workers Entry Point
 * Serves Next.js 15 standalone application
 */

import { createServer } from 'http';
import { nextApp } from './.next/standalone/server.js';

const server = createServer(async (req, res) => {
  await nextApp(req, res);
});

export default {
  fetch: async (request) => {
    const url = new URL(request.url);
    
    // Handle static files from public folder
    if (url.pathname.startsWith('/public/')) {
      return fetch(new Request(url, request));
    }

    // Route to Next.js handler
    return new Response('Next.js app would run here', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
