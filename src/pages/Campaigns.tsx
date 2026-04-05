import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CampaignsTab } from '@/components/prospecting/CampaignsTab';

export default function CampaignsPage() {
  return (
    <DashboardLayout
      title="Campanhas"
      description="Gerencie suas campanhas de prospecção"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <CampaignsTab />
      </motion.div>
    </DashboardLayout>
  );
}
