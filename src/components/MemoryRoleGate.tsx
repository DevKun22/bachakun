import React from 'react';
import { LoaderCircle, Heart } from 'lucide-react';
type Role='anh'|'em';
export function MemoryRoleGate({onSelected}:{onSelected:(role:Role)=>void}){
 const [selected,setSelected]=React.useState<Role|null>(null);
 const [busy,setBusy]=React.useState(false);
 const [error,setError]=React.useState('');
 const submit=async()=>{
  if(!selected||busy)return;setBusy(true);setError('');
  try{
   const response=await fetch('/api/memory-role',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:selected})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(data.error||'Chưa chọn được vai trò');
   onSelected(data.role);
  }catch(e){setError(e instanceof Error?e.message:'Chibi chưa mở sổ được');}finally{setBusy(false);}
 };
 return <main className="relative z-20 flex min-h-[100dvh] items-center justify-center px-4 py-10">
  <section className="w-full max-w-md rounded-[2rem] border border-rose-200 bg-white/95 p-5 text-center shadow-xl sm:p-8">
   <div className="mb-3 text-4xl" aria-hidden="true">🥰</div>
   <h1 className="font-serif-romantic text-2xl font-bold text-rose-600">Ú òa, ai ghé Chibi nè? 💗</h1>
   <p className="mt-2 text-sm text-slate-600">Cho Chibi biết để gọi đúng người nha! 🤭</p>
   <div className="mt-6 grid grid-cols-2 gap-3">
    {([{value:'anh',name:'Ăm Chã',hint:'Anh Bắp',emoji:'💗'},{value:'em',name:'Bà Chã',hint:'Em',emoji:'🌷'}] as const).map(option=><button type="button" key={option.value} disabled={busy} onClick={()=>setSelected(option.value)} aria-pressed={selected===option.value} className={`min-h-32 rounded-2xl border-2 p-3 transition-all focus-visible:outline focus-visible:outline-rose-500 ${selected===option.value?'border-rose-500 bg-rose-100 shadow-md':'border-rose-100 bg-rose-50/50'}`}><div className="text-3xl">{option.emoji}</div><div className="mt-2 font-bold text-rose-700">{option.name}</div><div className="text-xs text-slate-500">{option.hint}</div></button>)}
   </div>
   {error&&<p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
   <button type="button" onClick={()=>void submit()} disabled={!selected||busy} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-4 font-semibold text-white disabled:opacity-50">{busy?<LoaderCircle size={18} className="animate-spin"/>:<Heart size={18}/>} {busy?'Chibi đang mở sổ...':'Vào góc nhỏ thôi! 💌'}</button>
   <p className="mt-4 text-xs text-slate-400">Góc nhỏ lưu lượt ghé, xem ảnh và xem lại dấu thương để hai đứa cùng nhớ nha.</p>
  </section>
 </main>;
}
