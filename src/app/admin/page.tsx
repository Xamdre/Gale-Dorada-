"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = { id:string; name:string; slug:string; category:string; description:string; price_cop:number; stock:number; image_url:string|null; active:boolean; featured:boolean };
type Order = { id:string; order_number:number; customer_first_name:string; customer_last_name:string; customer_phone:string; delivery_address:string; delivery_city:string; total_cop:number; status:string; payment_status:string; created_at:string };
const money=(n:number)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
const statuses=["pending_payment","paid","preparing","shipped","delivered","cancelled","refunded"];
const statusLabel:Record<string,string>={pending_payment:"Pendiente de pago",paid:"Pagado",preparing:"En preparación",shipped:"Enviado",delivered:"Entregado",cancelled:"Cancelado",refunded:"Reembolsado"};

export default function AdminDashboard() {
  const router=useRouter();
  const [supabase,setSupabase]=useState<ReturnType<typeof createClient>|null>(null);
  const [products,setProducts]=useState<Product[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [section,setSection]=useState<"products"|"orders">("products");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [imageFile,setImageFile]=useState<File|null>(null);
  const blank={name:"",category:"General",description:"",price_cop:"",stock:"0",active:false,featured:false};
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState<string|null>(null);

  async function load(client:ReturnType<typeof createClient>) {
    const [p,o]=await Promise.all([
      client.from("products").select("id,name,slug,category,description,price_cop,stock,image_url,active,featured").order("created_at",{ascending:false}),
      client.from("orders").select("id,order_number,customer_first_name,customer_last_name,customer_phone,delivery_address,delivery_city,total_cop,status,payment_status,created_at").order("created_at",{ascending:false}).limit(100)
    ]);
    if(p.error) throw p.error;
    if(o.error) throw o.error;
    setProducts((p.data??[]) as Product[]); setOrders((o.data??[]) as Order[]);
  }

  useEffect(()=>{
    let active=true;
    try {
      const client=createClient(); setSupabase(client);
      client.auth.getUser().then(async ({data,error:authError})=>{
        if(!active)return;
        if(authError||!data.user){router.replace("/admin/login");return;}
        const {data:profile,error:profileError}=await client.from("profiles").select("role").eq("id",data.user.id).single();
        if(profileError||profile?.role!=="admin"){await client.auth.signOut();router.replace("/admin/login");return;}
        try{await load(client);}catch(e){setError(e instanceof Error?e.message:"No se pudieron cargar los datos.");}
        finally{if(active)setLoading(false);}
      });
    } catch(e){setError(e instanceof Error?e.message:"Falta configurar Supabase.");setLoading(false);}
    return()=>{active=false;};
  },[router]);

  function edit(p:Product){setEditing(p.id);setForm({name:p.name,category:p.category,description:p.description,price_cop:String(p.price_cop),stock:String(p.stock),active:p.active,featured:p.featured});setImageFile(null);setMessage("");}
  function reset(){setEditing(null);setForm(blank);setImageFile(null);}
  function chooseImage(event:ChangeEvent<HTMLInputElement>){setImageFile(event.target.files?.[0]??null);}

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!supabase)return;setSaving(true);setError("");setMessage("");
    try{
      let image_url:string|null=null;
      if(editing) image_url=products.find(p=>p.id===editing)?.image_url??null;
      if(imageFile){
        if(!imageFile.type.startsWith("image/"))throw new Error("Selecciona un archivo de imagen válido.");
        if(imageFile.size>5*1024*1024)throw new Error("La imagen debe pesar menos de 5 MB.");
        const ext=imageFile.name.split(".").pop()?.toLowerCase()||"jpg";
        const path=crypto.randomUUID()+"."+ext;
        const {error:uploadError}=await supabase.storage.from("product-images").upload(path,imageFile,{upsert:false,contentType:imageFile.type});
        if(uploadError)throw uploadError;
        image_url=supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const slug=form.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      const payload={name:form.name.trim(),slug:editing?(products.find(p=>p.id===editing)?.slug||slug):slug,category:form.category.trim()||"General",description:form.description.trim(),price_cop:Number(form.price_cop),stock:Number(form.stock),active:form.active,featured:form.featured,image_url};
      if(!payload.name||!Number.isInteger(payload.price_cop)||payload.price_cop<0||!Number.isInteger(payload.stock)||payload.stock<0)throw new Error("Revisa el nombre, precio y existencias.");
      const result=editing?await supabase.from("products").update({...payload,updated_at:new Date().toISOString()}).eq("id",editing):await supabase.from("products").insert(payload);
      if(result.error)throw result.error;
      await load(supabase);reset();setMessage("Producto guardado correctamente.");
    }catch(e){setError(e instanceof Error?e.message:"No se pudo guardar el producto.");}
    finally{setSaving(false);}
  }

  async function removeProduct(id:string){
    if(!supabase||!window.confirm("¿Eliminar este producto?"))return;
    const {error:e}=await supabase.from("products").delete().eq("id",id);
    if(e){setError(e.message);return;} await load(supabase);setMessage("Producto eliminado.");
  }
  async function updateStatus(id:string,status:string){
    if(!supabase)return;setError("");const {error:e}=await supabase.from("orders").update({status,updated_at:new Date().toISOString()}).eq("id",id);
    if(e){setError(e.message);return;}setOrders(current=>current.map(o=>o.id===id?{...o,status}:o));setMessage("Estado del pedido actualizado.");
  }
  async function signOut(){if(supabase)await supabase.auth.signOut();router.replace("/admin/login");router.refresh();}

  return <main className="admin-dashboard"><header className="admin-top"><Link href="/" className="admin-brand"><span>GD</span> GALE DORADA</Link><div><span>Administración</span><button onClick={signOut}>Cerrar sesión</button></div></header><div className="admin-content"><div className="admin-heading"><div><span className="admin-kicker">CENTRO DE CONTROL</span><h1>Tu tienda, bajo control.</h1><p>Gestiona productos, inventario y pedidos desde un solo lugar.</p></div><Link href="/" target="_blank" className="admin-view-store">Ver tienda ↗</Link></div>
  {error&&<div className="admin-error">{error}</div>}{message&&<div className="admin-success">{message}</div>}
  <div className="admin-stats"><article><span>Productos</span><strong>{products.length}</strong><small>Registrados en catálogo</small></article><article><span>Activos</span><strong>{products.filter(p=>p.active).length}</strong><small>Visibles en la tienda</small></article><article><span>Pedidos</span><strong>{orders.length}</strong><small>Últimos 100 pedidos</small></article><article><span>Por gestionar</span><strong>{orders.filter(o=>["paid","preparing","shipped"].includes(o.status)).length}</strong><small>Pedidos en proceso</small></article></div>
  <div className="admin-tabs"><button className={section==="products"?"selected":""} onClick={()=>setSection("products")}>Productos e inventario</button><button className={section==="orders"?"selected":""} onClick={()=>setSection("orders")}>Pedidos</button></div>
  {loading?<div className="admin-loading">Cargando información segura de tu tienda…</div>:section==="products"?<div className="admin-workspace"><section className="admin-panel"><div className="admin-panel-title"><div><span className="admin-kicker">{editing?"EDITAR":"NUEVO"} PRODUCTO</span><h2>{editing?"Actualizar producto":"Agregar producto"}</h2></div></div><form className="admin-product-form" onSubmit={save}><label>Nombre<input required maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ej. Caja de regalo"/></label><div className="admin-two"><label>Categoría<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="General"/></label><label>Precio (COP)<input type="number" min="0" step="1" required value={form.price_cop} onChange={e=>setForm({...form,price_cop:e.target.value})} placeholder="45000"/></label></div><label>Descripción<textarea rows={3} maxLength={1000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe el producto..."/></label><label>Existencias<input type="number" min="0" step="1" required value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label><label>Fotografía<input type="file" accept="image/*" onChange={chooseImage}/><small>Imagen JPG, PNG o WEBP. Máximo 5 MB.</small></label><div className="admin-checks"><label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Publicar en la tienda</label><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Destacar producto</label></div><div className="admin-form-actions"><button className="admin-primary" disabled={saving}>{saving?"Guardando…":editing?"Guardar cambios":"Crear producto"}</button>{editing&&<button type="button" className="admin-secondary" onClick={reset}>Cancelar</button>}</div></form></section>
  <section className="admin-panel"><div className="admin-panel-title"><div><span className="admin-kicker">CATÁLOGO</span><h2>Productos registrados</h2></div><span>{products.length} total</span></div>{products.length===0?<div className="admin-empty">Aún no hay productos. Usa el formulario para agregar el primero.</div>:<div className="admin-product-list">{products.map(p=><article className="admin-product-row" key={p.id}>{p.image_url?<img src={p.image_url} alt=""/>:<div className="admin-product-placeholder">GD</div>}<div className="admin-product-info"><strong>{p.name}</strong><span>{money(p.price_cop)} · Stock: {p.stock}</span><small>{p.active?"Publicado":"Borrador"}{p.featured?" · Destacado":""}</small></div><div className="admin-row-actions"><button onClick={()=>edit(p)}>Editar</button><button className="danger" onClick={()=>removeProduct(p.id)}>Eliminar</button></div></article>)}</div>}</section></div>:<section className="admin-panel admin-orders"><div className="admin-panel-title"><div><span className="admin-kicker">VENTAS</span><h2>Pedidos recientes</h2></div><span>{orders.length} pedidos</span></div>{orders.length===0?<div className="admin-empty">Todavía no hay pedidos. Aparecerán aquí cuando se habilite el checkout.</div>:<div className="admin-order-list">{orders.map(o=><article className="admin-order" key={o.id}><div className="admin-order-top"><strong>Pedido #{o.order_number}</strong><b>{money(o.total_cop)}</b></div><p>{o.customer_first_name} {o.customer_last_name} · {o.customer_phone}</p><p>{o.delivery_address}{o.delivery_city?", "+o.delivery_city:""}</p><div className="admin-order-bottom"><small>{new Date(o.created_at).toLocaleString("es-CO")} · Pago: {o.payment_status}</small><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}</select></div></article>)}</div>}</section>}
  <p className="admin-security-note">Conexión protegida por Supabase Auth y políticas RLS. Las claves privadas nunca se exponen al navegador.</p></div></main>;
}
