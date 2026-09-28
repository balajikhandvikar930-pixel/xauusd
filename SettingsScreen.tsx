import { useState } from 'react';
import { User, AlertCircle, CheckCircle2, FlaskConical, Info } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabaseClient';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/AppLayout';
import { aiVisionService } from '@/lib/aiVisionService';

export function SettingsScreen() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and AI service configuration" />

      <div className="space-y-6">
        {/* Account */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Account</h3>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-sm font-medium text-white">{user?.email}</p>
          </div>
        </GlassCard>

        {/* AI service status */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">AI Vision Service</h3>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${aiVisionService.isMock ? 'border-amber-500/20 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
              {aiVisionService.isMock ? (
                <Info className="h-4 w-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
              <span className={`text-sm ${aiVisionService.isMock ? 'text-amber-300' : 'text-emerald-300'}`}>
                {aiVisionService.isMock ? 'Mock mode — using sample data for UI development' : 'Live AI vision API connected'}
              </span>
            </div>

            <div className="rounded-lg bg-white/5 px-3 py-3">
              <p className="text-xs text-slate-500">Provider</p>
              <p className="text-sm text-slate-300">{aiVisionService.isMock ? 'Mock (not connected)' : 'Configured'}</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              The AI vision service interface is ready. When the real provider is connected in the service layer,
              all analyses will automatically use live results without any UI changes.
            </p>
          </div>
        </GlassCard>

        {/* Change password */}
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Change Password</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              const { error } = await supabase.auth.updateUser({ password: newPassword });
              if (error) {
                setMsg({ type: 'error', text: error.message });
              } else {
                setMsg({ type: 'success', text: 'Password updated successfully.' });
                setOldPassword('');
                setNewPassword('');
              }
            }}
            className="space-y-3"
          >
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-400/50 focus:outline-none"
              />
            </div>
            {msg && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {msg.text}
              </div>
            )}
            <button
              type="submit"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Update Password
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
