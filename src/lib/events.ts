import { supabase } from './supabase';
export type LoveEvent = 'love_yes_clicked' | 'letter_unlocked' | 'letter_opened' | 'reply_sent';
const sessionKey = 'bap_kunn_session_id';
export function getSessionId(): string {
  let id = localStorage.getItem(sessionKey);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(sessionKey, id); }
  return id;
}
export async function recordLoveEvent(name: LoveEvent): Promise<boolean> {
  if (!supabase) return false;
  const key = `bap_kunn_event_${name}`;
  if (localStorage.getItem(key) === 'true') return true;
  try {
    const { error } = await supabase.from('love_events').insert({ event_name: name, session_id: getSessionId() });
    if (error) throw error;
    localStorage.setItem(key, 'true');
    return true;
  } catch (error) { console.warn('Không lưu được mốc:', error); return false; }
}
