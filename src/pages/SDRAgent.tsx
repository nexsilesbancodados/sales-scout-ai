import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SDRAgentDashboard } from '@/components/sdr/SDRAgentDashboard';

export default function SDRAgentPage() {
  return (
    <DashboardLayout
      title="Agente SDR"
      description="Configure e monitore seu agente de qualificação de leads em tempo real"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <SDRAgentDashboard />
      </motion.div>
    </DashboardLayout>
  );
}
