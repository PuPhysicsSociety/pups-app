import React from 'react';
import { getSiteContentServer } from '@/lib/server/siteContent';
import HomeClient from './HomeClient';

// Without this, Next would statically bake this page's content at build
// time (it's a fixed route with no dynamic segments) and admin edits
// wouldn't show up until the next full redeploy.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const content = await getSiteContentServer('home');
  return <HomeClient content={content} />;
}
