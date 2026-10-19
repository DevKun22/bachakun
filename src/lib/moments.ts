import { recordLoveEvent } from './events';
export type MomentName = 'letter_unlocked' | 'letter_opened';
export async function recordMoment(name: MomentName): Promise<void> { await recordLoveEvent(name); }
