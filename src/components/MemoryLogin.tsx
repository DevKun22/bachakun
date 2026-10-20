import React from 'react';
import { Heart, LockKeyhole, LoaderCircle } from 'lucide-react';
export function MemoryLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/memory-auth', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Mở khóa chưa thành công'); }
      setPassword(''); onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'Mở khóa chưa thành công'); }
    finally { setLoading(false); }
  };
  return <main className="relative z-20 flex min-h-screen items-center justify-center px-4 py-12">
    <section className="w-full max-w-md rounded-[2rem] border border-rose-200 bg-white/95 px-7 py-10 text-center shadow-xl shadow-rose-100">
      <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500"><LockKeyhole size={32}/></span>
      <h1 className="font-serif-romantic text-2xl font-bold text-rose-600 sm:text-3xl">Góc nhỏ của Anh & Bà Chã 💗</h1>
      <p className="mt-3 text-sm text-slate-500">Chỉ hai đứa mình có chìa khóa mở góc nhỏ này thôi nha!</p>
      <form onSubmit={submit} className="mt-7 space-y-4 text-left">
        <label htmlFor="memory-password" className="block text-sm font-medium text-rose-700">Mật khẩu chung của hai đứa</label>
        <input id="memory-password" type="password" autoComplete="current-password" required minLength={1} maxLength={256} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu..." className="w-full rounded-xl border border-rose-200 bg-rose-50/30 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-300"/>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={loading || !password} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? <LoaderCircle size={18} className="animate-spin"/> : <Heart size={18}/>} Mở góc nhỏ của mình 💌</button>
      </form>
      <p className="mt-6 text-xs text-rose-400">Đừng chia sẻ mật khẩu với người khác nha 💗</p>
    </section>
  </main>;
}
