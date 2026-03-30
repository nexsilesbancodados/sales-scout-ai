import { useState, useRef, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Users } from 'lucide-react';

export function ROICalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(500);
  const [ticketMedio, setTicketMedio] = useState(2000);
  const [taxaConversao, setTaxaConversao] = useState(5);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const clientesConvertidos = Math.round(leadsPerMonth * (taxaConversao / 100));
  const receitaMensal = clientesConvertidos * ticketMedio;
  const roi = receitaMensal > 0 ? Math.round((receitaMensal / 149) * 100) / 100 : 0;

  return (
    <div
      ref={ref}
      className="max-w-4xl mx-auto"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
        transition: 'all 0.9s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#7B2FF2]/10">
              <Calculator className="h-5 w-5 text-[#7B2FF2]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Simule seu resultado</h3>
          </div>

          <SliderInput
            label="Leads captados/mês"
            value={leadsPerMonth}
            onChange={setLeadsPerMonth}
            min={50}
            max={2000}
            step={50}
            suffix=" leads"
          />
          <SliderInput
            label="Ticket médio (R$)"
            value={ticketMedio}
            onChange={setTicketMedio}
            min={100}
            max={10000}
            step={100}
            prefix="R$ "
          />
          <SliderInput
            label="Taxa de conversão"
            value={taxaConversao}
            onChange={setTaxaConversao}
            min={1}
            max={20}
            step={1}
            suffix="%"
          />
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-[#7B2FF2]/10 via-[#E91E8C]/5 to-transparent border border-white/[0.08] rounded-2xl p-8 flex flex-col justify-center gap-6">
          <ResultCard
            icon={Users}
            label="Clientes convertidos/mês"
            value={clientesConvertidos.toString()}
            color="#00B4D8"
            delay={0.1}
            inView={inView}
          />
          <ResultCard
            icon={DollarSign}
            label="Receita mensal estimada"
            value={`R$ ${receitaMensal.toLocaleString('pt-BR')}`}
            color="#7B2FF2"
            delay={0.2}
            inView={inView}
          />
          <ResultCard
            icon={TrendingUp}
            label="ROI sobre o plano Pro"
            value={`${roi.toLocaleString('pt-BR')}x`}
            color="#E91E8C"
            highlight
            delay={0.3}
            inView={inView}
          />
        </div>
      </div>
    </div>
  );
}

function SliderInput({
  label, value, onChange, min, max, step, prefix = '', suffix = '',
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; prefix?: string; suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] text-white/50">{label}</span>
        <span className="text-[14px] font-semibold text-white">{prefix}{value.toLocaleString('pt-BR')}{suffix}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="roi-slider w-full"
          style={{
            background: `linear-gradient(to right, #7B2FF2 0%, #E91E8C ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon, label, value, color, highlight, delay, inView,
}: {
  icon: any; label: string; value: string; color: string;
  highlight?: boolean; delay: number; inView: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${highlight ? 'bg-white/[0.06] border-white/[0.1]' : 'bg-white/[0.02] border-transparent'}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(20px)',
        transition: `all 0.6s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${highlight ? 'landing-gradient-text' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );
}
