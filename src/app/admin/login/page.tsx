"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Esta cuenta no tiene permisos de administración.");
      }
      router.replace("/admin"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo iniciar sesión."); }
    finally { setLoading(false); }
  }
  return <main className="admin-shell"><Link href="/" className="admin-back">← Volver a Gale Dorada</Link><section className="admin-login-card"><span className="admin-kicker">GALE DORADA · ADMINISTRACIÓN</span><div className="admin-monogram">GD</div><h1>Panel de control</h1><p>Acceso privado para gestionar tu tienda.</p>{!configured ? <div className="admin-alert">El panel está preparado, pero aún falta conectar Supabase. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Render y ejecuta la migración SQL del repositorio.</div> : <form onSubmit={submit}><label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@tudominio.com"/></label><label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tu contraseña"/></label>{error && <div className="admin-error">{error}</div>}<button className="admin-primary" disabled={loading}>{loading ? "Verificando..." : "Ingresar al panel"}</button></form>}<small>El acceso está protegido mediante Supabase Auth y permisos de administrador.</small></section></main>;
}
