'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Page() {
  const r = useRouter();
  useEffect(() => { r.replace('/admin?tab=pages'); }, [r]);
  return null;
}
