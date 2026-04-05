
-- Fix community_leads: restrict SELECT to own contributions
DROP POLICY IF EXISTS "Anyone authenticated can read community leads" ON public.community_leads;
CREATE POLICY "Users can read their own community leads"
ON public.community_leads
FOR SELECT
TO authenticated
USING (contributed_by = auth.uid());

-- Fix community_leads: restrict INSERT to own user
DROP POLICY IF EXISTS "Anyone authenticated can insert community leads" ON public.community_leads;
CREATE POLICY "Users can insert their own community leads"
ON public.community_leads
FOR INSERT
TO authenticated
WITH CHECK (contributed_by = auth.uid());

-- Fix chat_messages: change from public to authenticated
DROP POLICY IF EXISTS "Users can manage chat messages of their leads" ON public.chat_messages;
CREATE POLICY "Users can manage chat messages of their leads"
ON public.chat_messages
FOR ALL
TO authenticated
USING (is_lead_owner(lead_id));

-- Fix activity_log policies: public -> authenticated
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_log;
CREATE POLICY "Users can insert their own activity"
ON public.activity_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_log;
CREATE POLICY "Users can view their own activity"
ON public.activity_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot delete activity logs" ON public.activity_log;
CREATE POLICY "Users cannot delete activity logs"
ON public.activity_log FOR DELETE TO authenticated
USING (false);

DROP POLICY IF EXISTS "Users cannot update activity logs" ON public.activity_log;
CREATE POLICY "Users cannot update activity logs"
ON public.activity_log FOR UPDATE TO authenticated
USING (false);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
CREATE POLICY "Users can create their own campaigns"
ON public.campaigns FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns"
ON public.campaigns FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix background_jobs policies
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.background_jobs;
CREATE POLICY "Users can create their own jobs"
ON public.background_jobs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.background_jobs;
CREATE POLICY "Users can delete their own jobs"
ON public.background_jobs FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own jobs" ON public.background_jobs;
CREATE POLICY "Users can update their own jobs"
ON public.background_jobs FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own jobs" ON public.background_jobs;
CREATE POLICY "Users can view their own jobs"
ON public.background_jobs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix meetings policies
DROP POLICY IF EXISTS "Users can manage their own meetings" ON public.meetings;
CREATE POLICY "Users can manage their own meetings"
ON public.meetings FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix follow_up_sequences policies
DROP POLICY IF EXISTS "Users can manage their own sequences" ON public.follow_up_sequences;
CREATE POLICY "Users can manage their own sequences"
ON public.follow_up_sequences FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix leads policies
DROP POLICY IF EXISTS "Users can manage their own leads" ON public.leads;
CREATE POLICY "Users can manage their own leads"
ON public.leads FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Team members can view team leads" ON public.leads;
CREATE POLICY "Team members can view team leads"
ON public.leads FOR SELECT TO authenticated
USING ((user_id = auth.uid()) OR (team_id IN (SELECT get_user_team_ids(auth.uid()))));

-- Fix agent_escalations policies
DROP POLICY IF EXISTS "Users can delete their own escalations" ON public.agent_escalations;
CREATE POLICY "Users can delete their own escalations"
ON public.agent_escalations FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own escalations" ON public.agent_escalations;
CREATE POLICY "Users can insert their own escalations"
ON public.agent_escalations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own escalations" ON public.agent_escalations;
CREATE POLICY "Users can update their own escalations"
ON public.agent_escalations FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own escalations" ON public.agent_escalations;
CREATE POLICY "Users can view their own escalations"
ON public.agent_escalations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix antiban_config
DROP POLICY IF EXISTS "Users manage own antiban config" ON public.antiban_config;
CREATE POLICY "Users manage own antiban config"
ON public.antiban_config FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix buying_signals
DROP POLICY IF EXISTS "Users can delete their own buying signals" ON public.buying_signals;
CREATE POLICY "Users can delete their own buying signals"
ON public.buying_signals FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own buying signals" ON public.buying_signals;
CREATE POLICY "Users can insert their own buying signals"
ON public.buying_signals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own buying signals" ON public.buying_signals;
CREATE POLICY "Users can update their own buying signals"
ON public.buying_signals FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own buying signals" ON public.buying_signals;
CREATE POLICY "Users can view their own buying signals"
ON public.buying_signals FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix chip_health_logs
DROP POLICY IF EXISTS "Users view own health logs" ON public.chip_health_logs;
CREATE POLICY "Users view own health logs"
ON public.chip_health_logs FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix favorite_leads
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorite_leads;
CREATE POLICY "Users can manage their own favorites"
ON public.favorite_leads FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix generated_proposals
DROP POLICY IF EXISTS "Users can delete their own proposals" ON public.generated_proposals;
CREATE POLICY "Users can delete their own proposals"
ON public.generated_proposals FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own proposals" ON public.generated_proposals;
CREATE POLICY "Users can insert their own proposals"
ON public.generated_proposals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own proposals" ON public.generated_proposals;
CREATE POLICY "Users can update their own proposals"
ON public.generated_proposals FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own proposals" ON public.generated_proposals;
CREATE POLICY "Users can view their own proposals"
ON public.generated_proposals FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix intelligent_followups
DROP POLICY IF EXISTS "Users can delete their own followups" ON public.intelligent_followups;
CREATE POLICY "Users can delete their own followups"
ON public.intelligent_followups FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own followups" ON public.intelligent_followups;
CREATE POLICY "Users can insert their own followups"
ON public.intelligent_followups FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own followups" ON public.intelligent_followups;
CREATE POLICY "Users can update their own followups"
ON public.intelligent_followups FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own followups" ON public.intelligent_followups;
CREATE POLICY "Users can view their own followups"
ON public.intelligent_followups FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix job_logs
DROP POLICY IF EXISTS "Users can insert their own job logs" ON public.job_logs;
CREATE POLICY "Users can insert their own job logs"
ON public.job_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own job logs" ON public.job_logs;
CREATE POLICY "Users can view their own job logs"
ON public.job_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot delete job logs" ON public.job_logs;
CREATE POLICY "Users cannot delete job logs"
ON public.job_logs FOR DELETE TO authenticated
USING (false);

DROP POLICY IF EXISTS "Users cannot update job logs" ON public.job_logs;
CREATE POLICY "Users cannot update job logs"
ON public.job_logs FOR UPDATE TO authenticated
USING (false);

-- Fix lead_memory
DROP POLICY IF EXISTS "Users can create lead memories" ON public.lead_memory;
CREATE POLICY "Users can create lead memories"
ON public.lead_memory FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lead memories" ON public.lead_memory;
CREATE POLICY "Users can delete their own lead memories"
ON public.lead_memory FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lead memories" ON public.lead_memory;
CREATE POLICY "Users can update their own lead memories"
ON public.lead_memory FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own lead memories" ON public.lead_memory;
CREATE POLICY "Users can view their own lead memories"
ON public.lead_memory FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix lead_notes
DROP POLICY IF EXISTS "Users can create their own lead notes" ON public.lead_notes;
CREATE POLICY "Users can create their own lead notes"
ON public.lead_notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lead notes" ON public.lead_notes;
CREATE POLICY "Users can delete their own lead notes"
ON public.lead_notes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lead notes" ON public.lead_notes;
CREATE POLICY "Users can update their own lead notes"
ON public.lead_notes FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own lead notes" ON public.lead_notes;
CREATE POLICY "Users can view their own lead notes"
ON public.lead_notes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix lead_qualification
DROP POLICY IF EXISTS "Users can delete their own lead qualifications" ON public.lead_qualification;
CREATE POLICY "Users can delete their own lead qualifications"
ON public.lead_qualification FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own lead qualifications" ON public.lead_qualification;
CREATE POLICY "Users can insert their own lead qualifications"
ON public.lead_qualification FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lead qualifications" ON public.lead_qualification;
CREATE POLICY "Users can update their own lead qualifications"
ON public.lead_qualification FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own lead qualifications" ON public.lead_qualification;
CREATE POLICY "Users can view their own lead qualifications"
ON public.lead_qualification FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix message_templates
DROP POLICY IF EXISTS "Users can create their own templates" ON public.message_templates;
CREATE POLICY "Users can create their own templates"
ON public.message_templates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.message_templates;
CREATE POLICY "Users can delete their own templates"
ON public.message_templates FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.message_templates;
CREATE POLICY "Users can update their own templates"
ON public.message_templates FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own templates" ON public.message_templates;
CREATE POLICY "Users can view their own templates"
ON public.message_templates FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix message_variations
DROP POLICY IF EXISTS "Users manage own variations" ON public.message_variations;
CREATE POLICY "Users manage own variations"
ON public.message_variations FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix niche_patterns
DROP POLICY IF EXISTS "Users can delete their own niche patterns" ON public.niche_patterns;
CREATE POLICY "Users can delete their own niche patterns"
ON public.niche_patterns FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own niche patterns" ON public.niche_patterns;
CREATE POLICY "Users can insert their own niche patterns"
ON public.niche_patterns FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own niche patterns" ON public.niche_patterns;
CREATE POLICY "Users can update their own niche patterns"
ON public.niche_patterns FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own niche patterns" ON public.niche_patterns;
CREATE POLICY "Users can view their own niche patterns"
ON public.niche_patterns FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix prospecting_history
DROP POLICY IF EXISTS "Users can create their own prospecting history" ON public.prospecting_history;
CREATE POLICY "Users can create their own prospecting history"
ON public.prospecting_history FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own prospecting history" ON public.prospecting_history;
CREATE POLICY "Users can delete their own prospecting history"
ON public.prospecting_history FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own prospecting history" ON public.prospecting_history;
CREATE POLICY "Users can update their own prospecting history"
ON public.prospecting_history FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own prospecting history" ON public.prospecting_history;
CREATE POLICY "Users can view their own prospecting history"
ON public.prospecting_history FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix prospecting_stats
DROP POLICY IF EXISTS "Users can create their own stats" ON public.prospecting_stats;
CREATE POLICY "Users can create their own stats"
ON public.prospecting_stats FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON public.prospecting_stats;
CREATE POLICY "Users can update their own stats"
ON public.prospecting_stats FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own stats" ON public.prospecting_stats;
CREATE POLICY "Users can view their own stats"
ON public.prospecting_stats FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix scheduled_prospecting
DROP POLICY IF EXISTS "Users can manage their own scheduled prospecting" ON public.scheduled_prospecting;
CREATE POLICY "Users can manage their own scheduled prospecting"
ON public.scheduled_prospecting FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix search_history
DROP POLICY IF EXISTS "Users can manage their own search history" ON public.search_history;
CREATE POLICY "Users can manage their own search history"
ON public.search_history FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Fix service_intelligence
DROP POLICY IF EXISTS "Users can delete their own service intelligence" ON public.service_intelligence;
CREATE POLICY "Users can delete their own service intelligence"
ON public.service_intelligence FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own service intelligence" ON public.service_intelligence;
CREATE POLICY "Users can insert their own service intelligence"
ON public.service_intelligence FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own service intelligence" ON public.service_intelligence;
CREATE POLICY "Users can update their own service intelligence"
ON public.service_intelligence FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own service intelligence" ON public.service_intelligence;
CREATE POLICY "Users can view their own service intelligence"
ON public.service_intelligence FOR SELECT TO authenticated
USING (auth.uid() = user_id);
