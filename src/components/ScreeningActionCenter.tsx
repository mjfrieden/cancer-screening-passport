import { AlertTriangle, CalendarPlus, CheckCircle2, ChevronRight, ClipboardCheck, Clock3 } from 'lucide-react';
import { Recommendation, ReminderPreference, ScreeningCareStatus, ScreeningEvent } from '../types';
import { downloadScreeningCalendar } from '../lib/calendar';
import { getCareStatus, hasUnresolvedAbnormalResult, legacyStatusForCareStatus } from '../lib/screeningEvents';
import { getPreparationItems } from '../lib/screeningPreparation';
import { getScreeningReminder } from '../lib/screeningReminders';

const CARE_STATUS_LABELS: Record<ScreeningCareStatus, string> = {
  discuss: 'Discuss with clinician',
  order_requested: 'Order requested',
  ordered: 'Ordered',
  scheduled: 'Scheduled',
  completed: 'Test completed',
  result_received: 'Result received',
  follow_up_needed: 'Follow-up needed',
  resolved: 'Resolved',
};

interface ScreeningActionCenterProps {
  events: ScreeningEvent[];
  recommendations: Recommendation[];
  onStartRecommendation: (recommendation: Recommendation) => void;
  onEditEvent: (event: ScreeningEvent) => void;
  onUpdateEvent: (event: ScreeningEvent, patch: Partial<ScreeningEvent>) => void;
}

export default function ScreeningActionCenter({
  events,
  recommendations,
  onStartRecommendation,
  onEditEvent,
  onUpdateEvent,
}: ScreeningActionCenterProps) {
  const unresolved = events.filter(hasUnresolvedAbnormalResult);
  const activeEvents = events
    .filter(event => !hasUnresolvedAbnormalResult(event) && !['resolved', 'result_received'].includes(getCareStatus(event)))
    .sort((a, b) => (a.appointmentDate || a.date).localeCompare(b.appointmentDate || b.date));
  const actionableRecommendations = recommendations
    .filter(rec => !['prevention', 'completed', 'not_recommended'].includes(rec.status))
    .sort((a, b) => actionPriority(a.status) - actionPriority(b.status))
    .slice(0, 3);

  return (
    <section aria-labelledby="next-steps-heading" className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-blue-700">Action center</p>
        <h2 id="next-steps-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-gray-950">Your next steps</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">Start with the first open item. Abnormal results stay here until you mark follow-up resolved.</p>
      </div>

      {unresolved.map(event => (
        <article key={event.id} className="rounded-3xl border-2 border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-600 p-2.5 text-white"><AlertTriangle className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-red-700">Follow-up remains open</div>
              <h3 className="mt-1 text-lg font-extrabold text-red-950">{friendlyType(event.type)} result needs follow-up</h3>
              <p className="mt-1 text-sm leading-relaxed text-red-900">Contact the clinician who ordered the test, confirm the recommended next step, and keep this open until follow-up is complete.</p>
              {event.followUpNote && <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-red-950"><strong>Your note:</strong> {event.followUpNote}</p>}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="text-sm font-semibold text-red-950">
              Follow-up progress
              <select
                value={getCareStatus(event)}
                onChange={e => {
                  const nextStatus = e.target.value as ScreeningCareStatus;
                  if (['scheduled', 'completed', 'result_received'].includes(nextStatus)) {
                    onEditEvent(event);
                    return;
                  }
                  updateCareStatus(event, nextStatus, onUpdateEvent);
                }}
                className="mt-1 w-full rounded-xl border border-red-200 bg-white p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="follow_up_needed">Follow-up needed</option>
                <option value="discuss">Discussing with clinician</option>
                <option value="order_requested">Order or referral requested</option>
                <option value="ordered">Follow-up ordered</option>
                <option value="scheduled">Follow-up scheduled — add details</option>
                <option value="completed">Follow-up test completed</option>
                <option value="result_received">Follow-up result received</option>
                <option value="resolved">Resolved with care team</option>
              </select>
            </label>
            <button type="button" onClick={() => onEditEvent(event)} className="self-end rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-800 hover:bg-red-100">
              Add details
            </button>
          </div>
          {getCareStatus(event) === 'scheduled' && (
            <ScheduledSupport event={event} onUpdateEvent={onUpdateEvent} />
          )}
        </article>
      ))}

      {activeEvents.map(event => (
        <article key={event.id} className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-100 p-2.5 text-blue-700"><Clock3 className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">{CARE_STATUS_LABELS[getCareStatus(event)]}</div>
              <h3 className="mt-1 text-lg font-bold text-gray-950">{friendlyType(event.type)}</h3>
              {event.appointmentDate && <p className="mt-1 text-sm text-gray-600">Appointment: {formatDisplayDate(event.appointmentDate)}</p>}
            </div>
            <button type="button" onClick={() => onEditEvent(event)} className="rounded-xl border border-blue-100 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">Update</button>
          </div>

          {getCareStatus(event) === 'scheduled' && (
            <ScheduledSupport event={event} onUpdateEvent={onUpdateEvent} />
          )}
        </article>
      ))}

      {actionableRecommendations.map(rec => (
        <article key={rec.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">{rec.status === 'needs_review' ? 'Confirm your plan' : 'Screening action'}</div>
              <h3 className="mt-1 text-lg font-bold text-gray-950">{capitalize(rec.cancer_type)} screening</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{rec.recommended_action}</p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-300" />
          </div>
          <button type="button" onClick={() => onStartRecommendation(rec)} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
            {rec.status === 'needs_review' ? 'Plan clinician discussion' : 'Start this plan'}
          </button>
        </article>
      ))}

      {unresolved.length === 0 && activeEvents.length === 0 && actionableRecommendations.length === 0 && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <h3 className="mt-2 font-bold text-emerald-950">No open actions</h3>
          <p className="mt-1 text-sm text-emerald-800">Keep your profile and screening history current.</p>
        </div>
      )}
    </section>
  );
}

function ScheduledSupport({ event, onUpdateEvent }: Pick<ScreeningActionCenterProps, 'onUpdateEvent'> & { event: ScreeningEvent }) {
  const preparation = getPreparationItems(event.type);
  const completed = event.preparationCompleted ?? [];
  const reminder = getScreeningReminder(event);

  return (
    <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
      {reminder && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          {reminder}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => downloadScreeningCalendar(event)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100">
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </button>
        <label className="text-xs font-bold text-gray-700">
          Reminder preference
          <select
            value={event.reminderPreference ?? 'none'}
            onChange={e => onUpdateEvent(event, { reminderPreference: e.target.value as ReminderPreference })}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium"
          >
            <option value="none">No app reminder</option>
            <option value="one_day">1 day before</option>
            <option value="one_week">1 week before</option>
            <option value="both">1 week and 1 day before</option>
          </select>
        </label>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><ClipboardCheck className="h-4 w-4 text-blue-600" /> Preparation checklist</div>
        <p className="mt-1 text-xs text-gray-500">Clinic instructions take priority. Do not stop medicines unless a clinician tells you to.</p>
        <div className="mt-3 space-y-2">
          {preparation.map(item => (
            <label key={item} className="flex cursor-pointer gap-3 rounded-xl border border-gray-100 p-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={completed.includes(item)}
                onChange={() => {
                  const next = completed.includes(item) ? completed.filter(value => value !== item) : [...completed, item];
                  onUpdateEvent(event, { preparationCompleted: next });
                }}
                className="mt-0.5 h-5 w-5 accent-blue-600"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function updateCareStatus(event: ScreeningEvent, careStatus: ScreeningCareStatus, onUpdate: ScreeningActionCenterProps['onUpdateEvent']) {
  onUpdate(event, { careStatus, status: legacyStatusForCareStatus(careStatus) });
}

function actionPriority(status: Recommendation['status']): number {
  if (status === 'needs_review') return 0;
  if (status === 'overdue') return 1;
  if (status === 'due_now') return 2;
  return 3;
}

function friendlyType(type: ScreeningEvent['type']): string {
  return ({
    colonoscopy: 'Colonoscopy', fit: 'FIT stool test', cologuard: 'Stool DNA test', mammogram: 'Mammogram',
    pap: 'Pap test', hpv: 'HPV test', ldct: 'Low-dose lung CT', psa: 'PSA test',
    surveillance_imaging: 'Surveillance imaging', marker_check: 'Tumor marker check',
  })[type];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDisplayDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
