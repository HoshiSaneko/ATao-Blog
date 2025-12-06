import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateShortId } from '../utils/slug';
import { BLOG_NAME, SITE_DESCRIPTION, FRIEND_LINK_CONTACT } from '../config';

export const GET: APIRoute = async () => {
  const site = FRIEND_LINK_CONTACT.url.replace(/\/$/, '');

  const posts = await getCollection('blog');
  const sorted = posts.sort((a, b) => {
    const dateA = new Date(a.data.date.replace(/年|月|日/g, '/'));
    const dateB = new Date(b.data.date.replace(/年|月|日/g, '/'));
    return dateB.getTime() - dateA.getTime();
  });

  const items = sorted
    .map((post) => {
      const shortId = generateShortId(post.id);
      const url = `${site}/posts/${shortId}`;
      const pubDate = new Date(post.data.date.replace(/年|月|日/g, '/')).toUTCString();

      return `
      <item>
        <title><![CDATA[${post.data.title}]]></title>
        <link>${url}</link>
        <guid>${url}</guid>
        <description><![CDATA[${post.data.summary}]]></description>
        <pubDate>${pubDate}</pubDate>
      </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${BLOG_NAME}]]></title>
    <link>${site}</link>
    <description><![CDATA[${SITE_DESCRIPTION}]]></description>
    <language>zh-CN</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};


