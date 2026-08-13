import { ScreeningCareStatus, ScreeningEvent } from '../types';

export function getCareStatus(event: ScreeningEvent): ScreeningCareStatus {
  if (event.careStatus) return event.careStatus;
  if (event.status === 'scheduled') return 'scheduled';
  if (event.status === 'ordered') return 'ordered';
  if (event.isAbnormal) return 'follow_up_needed';
  return 'result_received';
}

export function legacyStatusForCareStatus(careStatus: ScreeningCareStatus): ScreeningEvent['status'] {
  if (careStatus === 'scheduled') return 'scheduled';
  if (careStatus === 'discuss' || careStatus === 'order_requested' || careStatus === 'ordered') return 'ordered';
  return 'completed';
}

export function hasUnresolvedAbnormalResult(event: ScreeningEvent): boolean {
  return event.isAbnormal && getCareStatus(event) !== 'resolved';
}

export function upsertScreeningEvent(events: ScreeningEvent[], nextEvent: ScreeningEvent): ScreeningEvent[] {
  const existingIndex = events.findIndex(event => event.id === nextEvent.id);
  if (existingIndex === -1) return [...events, nextEvent];

  return events.map(event => event.id === nextEvent.id ? nextEvent : event);
}

export function removeScreeningEvent(events: ScreeningEvent[], eventId: string): ScreeningEvent[] {
  return events.filter(event => event.id !== eventId);
}
