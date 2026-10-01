import type { Metadata } from 'next';
import { DebugDashboard } from '@/components/debug/DebugDashboard';

export const metadata: Metadata = {
  title: 'gcsebusiness — owner dashboard (vs Educake, USPs & unit economics)',
  description: 'Internal: competitive comparison vs Educake, unique selling points, AI free-tier capacity model and full cost breakdowns.',
  robots: { index: false, follow: false },
};

export default function DebugPage() {
  return <DebugDashboard />;
}
