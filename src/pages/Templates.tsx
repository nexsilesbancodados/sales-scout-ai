import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TemplatesTab } from '@/components/prospecting/TemplatesTab';

export default function TemplatesPage() {
  return (
    <DashboardLayout
      title="Templates de Mensagem"
      description="Crie e gerencie templates para suas campanhas"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <TemplatesTab />
      </motion.div>
    </DashboardLayout>
  );
}
