import { MeetingSettings } from '@/components/settings/MeetingSettings';

export default function SettingsMeetings() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Reuniões</h1>
        <p className="text-muted-foreground text-sm">Configure links de reunião e integração com Google Meet</p>
      </div>
      <MeetingSettings />
    </div>
  );
}
