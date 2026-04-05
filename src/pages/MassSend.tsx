import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MassSendTab } from '@/components/prospecting/MassSendTab';

export default function MassSendPage() {
  return (
    <DashboardLayout
      title="Disparo em Massa"
      description="Envie mensagens em massa para seus leads"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <MassSendTab />
      </motion.div>
    </DashboardLayout>
  );
}
