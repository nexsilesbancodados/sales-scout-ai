import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AntiBanDashboard } from '@/components/antiban';

export default function AntiBanPage() {
  return (
    <DashboardLayout
      title="Anti-Ban"
      description="Monitore a saúde do chip e configure proteções"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <AntiBanDashboard />
      </motion.div>
    </DashboardLayout>
  );
}
