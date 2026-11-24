"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Menu, Search, ShoppingBag, Sparkles, Heart, ShieldCheck, X, Plus, Minus, Trash2 } from "lucide-react";

type Product = { id: number; name: string; category: string; price: number; description: string; tone: string; symbol: string };
const products: Product[] = [];
const money = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export default function Home() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => products.filter(p => (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase())), [query]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  const add = (id: number) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const change = (id: number, delta: number) => setCart(c => { const n = (c[id] || 0) + delta; const next = { ...c }; if (n <= 0) delete next[id]; else next[id] = n; return next; });

  return <main>
    <div className="announcement">UN DETALLE ESPECIAL PUEDE CAMBIAR TODO · GALE DORADA</div>
    <header className="header">
      <button className="icon-btn mobile-toggle" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      <a className="brand" href="#"><span className="brand-mark">GD</span><span>GALE <b>DORADA</b><small>TIENDA EN LÍNEA</small></span></a>
      <nav className={menuOpen ? "nav nav-open" : "nav"}><a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a><a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a><a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a><a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a></nav>
      <div className="header-actions"><label className="searchbox"><Search size={17}/><input value={query} onChange={e => { setQuery(e.target.value); document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); }} placeholder="Buscar"/></label><button className="icon-btn cart-trigger" onClick={() => setCartOpen(true)} aria-label="Abrir carrito"><ShoppingBag/><span>{count}</span></button></div>
    </header>

    <section className="hero" id="inicio"><div className="hero-text"><span className="eyebrow"><i/> BIENVENIDO A GALE DORADA</span><h1>Lo especial<br/>vive en los <em>detalles.</em></h1><p>Encuentra ese detalle que expresa lo que las palabras no siempre alcanzan a decir. Una selección para regalar, celebrar y recordar.</p><div className="hero-actions"><a className="btn btn-gold" href="#catalogo">Explorar catálogo <ArrowRight size={17}/></a><a className="underlink" href="#nosotros">Conoce nuestra esencia</a></div><div className="hero-note"><Sparkles size={16}/> SELECCIONADO CON INTENCIÓN</div></div><div className="hero-visual"><div className="halo halo-a"/><div className="halo halo-b"/><div className="visual-center"><span>G</span><b>D</b></div><div className="visual-label"><strong>GALE DORADA</strong><small>ESPECIAL EN CADA DETALLE</small></div><span className="star star-a">✦</span><span className="star star-b">✧</span><span className="star star-c">✦</span></div><div className="hero-foot"><span>ESTILO · DETALLE · ESENCIA</span><span>DESCUBRE LA COLECCIÓN ↓</span></div></section>

    <section className="perks"><div><ShieldCheck/><span><b>Compra con confianza</b><small>Información clara en cada paso</small></span></div><div><Heart/><span><b>Detalles con intención</b><small>Para momentos que importan</small></span></div><div><Sparkles/><span><b>Una experiencia especial</b><small>Atención en cada detalle</small></span></div></section>

    <section className="catalog section" id="catalogo"><div className="section-head"><div><span className="eyebrow dark">DESCUBRE NUESTRA SELECCIÓN</span><h2>Un mundo de detalles</h2><p>Encuentra algo especial para esa ocasión.</p></div><span className="catalog-count">{filtered.length} PRODUCTOS</span></div>{filtered.length ? <div className="product-grid">{filtered.map((p, i) => <article className="product" key={p.id}><div className={"product-art " + p.tone}><span className="art-symbol">{p.symbol}</span><span className="art-brand">GALE DORADA</span><span className="art-number">0{i + 1}</span></div><div className="product-meta"><span>{p.category}</span><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price)}</strong><button className="add-btn" onClick={() => add(p.id)}><Plus size={16}/> Añadir</button></div></div></article>)}</div> : <div className="empty-catalog"><span className="empty-star">✦</span><h3>{query ? "No encontramos resultados" : "Estamos preparando algo especial"}</h3><p>{query ? "Prueba con otro término de búsqueda." : "Muy pronto encontrarás aquí el catálogo de Gale Dorada."}</p></div>}</section>

    <section className="story" id="nosotros"><div className="story-inner"><div className="story-seal"><span>GD</span><small>DESDE EL DETALLE</small></div><div><span className="eyebrow">NUESTRA ESENCIA</span><h2>Regalar también<br/>es una forma de <em>decir.</em></h2><p>En Gale Dorada creemos en el valor de los pequeños gestos. Queremos ayudarte a encontrar detalles que acompañen celebraciones, agradecimientos y recuerdos que merecen quedarse.</p><a className="btn btn-gold" href="#catalogo">Ver selección <ArrowRight size={17}/></a></div></div></section>
    <section className="closing"><span className="eyebrow dark">GALE DORADA</span><h2>Haz especial<br/>cada momento.</h2><a href="#catalogo" className="btn btn-dark">Descubrir productos <ArrowRight size={17}/></a></section>
    <footer id="contacto"><div className="footer-main"><div><a className="brand footer-brand" href="#"><span className="brand-mark">GD</span><span>GALE <b>DORADA</b><small>TIENDA EN LÍNEA</small></span></a><p>Pequeños detalles, grandes momentos.</p></div><div><b>Explora</b><a href="#inicio">Inicio</a><a href="#catalogo">Catálogo</a><a href="#nosotros">Nosotros</a></div><div><b>Atención</b><p>Pronto encontrarás aquí nuestros canales oficiales de atención.</p></div></div><div className="copyright">© {new Date().getFullYear()} Gale Dorada · Todos los derechos reservados</div></footer>

    {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow dark">TU SELECCIÓN</span><h2>Mi carrito ({count})</h2></div><button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X/></button></div>{count === 0 ? <div className="cart-empty"><ShoppingBag size={34}/><h3>Tu carrito está vacío</h3><p>Explora el catálogo y agrega tus favoritos.</p><button className="btn btn-dark" onClick={() => setCartOpen(false)}>Explorar catálogo</button></div> : <><div className="cart-lines">{products.filter(p => cart[p.id]).map(p => <div className="cart-line" key={p.id}><div className={"mini-art " + p.tone}>{p.symbol}</div><div className="line-info"><b>{p.name}</b><span>{money(p.price)}</span><div className="qty"><button onClick={() => change(p.id, -1)}><Minus size={13}/></button><span>{cart[p.id]}</span><button onClick={() => change(p.id, 1)}><Plus size={13}/></button><button className="remove" onClick={() => setCart(c => { const n = {...c}; delete n[p.id]; return n; })}><Trash2 size={14}/></button></div></div></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>{money(subtotal)}</strong><small>El envío se calculará al confirmar la compra.</small><button className="btn btn-gold checkout" onClick={() => alert("El checkout se habilitará al conectar la base de datos y la pasarela de pago.")}>Continuar compra <ArrowRight size={17}/></button></div></>}</aside></div>}
  </main>;
}