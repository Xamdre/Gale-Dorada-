import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ products: [], configured: false });
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("products").select("id,name,slug,category,description,price_cop,stock,image_url,featured").eq("active", true).gt("stock", 0).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "No se pudo cargar el catálogo." }, { status: 500 });
  const products = (data ?? []).map((p) => ({ id: p.id, name: p.name, category: p.category, description: p.description, price: p.price_cop, image_url: p.image_url, stock: p.stock, tone: "sand", symbol: p.name.slice(0, 1).toUpperCase() }));
  return NextResponse.json({ products, configured: true });
}
