import React from 'react';
import { getSiteContentServer } from '@/lib/server/siteContent';
import HomeClient from './HomeClient';
import PreviewBanner from '@/components/ui/PreviewBanner';

// Without this, Next would statically bake this page's content at build
// time (it's a fixed route with no dynamic segments) and admin edits
// wouldn't show up until the next full redeploy.
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const content = await getSiteContentServer('home', preview);
  return (
    <>
      {preview && <PreviewBanner />}
      <HomeClient content={content} />
    </>
  );
}
