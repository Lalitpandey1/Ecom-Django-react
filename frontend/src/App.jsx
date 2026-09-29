import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, ArrowRight, Check, ChevronDown, Heart, Leaf, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { apiRequest } from './api.js'

const categories = ['All items', 'Home', 'Accessories', 'Tech', 'Stationery']
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function App() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All items')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('field-cart') || '{}'))
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/products/').then(setProducts).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false))
  }, [])
  useEffect(() => { localStorage.setItem('field-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return
    apiRequest('/auth/me/').then(setUser).catch(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    })
  }, [])

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'All items' || product.category === category
      const query = search.trim().toLowerCase()
      return matchesCategory && (!query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query))
    })
    if (sortBy === 'price-low') return [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
    if (sortBy === 'price-high') return [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
    return filtered
  }, [products, category, search, sortBy])

  const cartItems = products.filter((product) => cart[product.id])
  const itemCount = Object.values(cart).reduce((total, count) => total + count, 0)
  const subtotal = cartItems.reduce((total, product) => total + Number(product.price) * cart[product.id], 0)

  function updateCart(productId, difference) {
    setCart((current) => {
      const nextCount = (current[productId] || 0) + difference
      const next = { ...current }
      if (nextCount <= 0) delete next[productId]
      else next[productId] = nextCount
      return next
    })
  }

  async function handleAuth(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const username = form.get('username')
    const email = form.get('email')
    const password = form.get('password')
    try {
      if (authMode === 'signup') await apiRequest('/auth/register/', { method: 'POST', body: JSON.stringify({ username, email, password }) })
      const tokens = await apiRequest('/auth/token/', { method: 'POST', body: JSON.stringify({ username: authMode === 'login' ? username : email, password }) })
      localStorage.setItem('accessToken', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)
      setUser(await apiRequest('/auth/me/'))
      setAuthOpen(false)
      setNotice('Welcome. Your account is ready.')
      window.setTimeout(() => setNotice(''), 2800)
    } catch (authError) {
      setNotice(authError.message)
    }
  }

  function signOut() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setNotice('You are signed out.')
    window.setTimeout(() => setNotice(''), 2400)
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="announcement"><Sparkles size={13} /> Thoughtful finds for everyday living <span className="announcement-dot">•</span> Free shipping over $75</div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Field and Form home"><span>field</span><i>&</i><span>form</span><sup>®</sup></a>
        <nav className="desktop-nav" aria-label="Shop categories"><a href="#catalog">Shop all</a><a href="#catalog" onClick={() => setCategory('Home')}>Home</a><a href="#catalog" onClick={() => setCategory('Accessories')}>Accessories</a><a href="#catalog" onClick={() => setCategory('Tech')}>Objects & tech</a></nav>
        <div className="header-actions">
          <button className="icon-button account-button" onClick={() => user ? signOut() : (setAuthMode('login'), setAuthOpen(true))} aria-label={user ? 'Sign out' : 'Sign in'} title={user ? 'Sign out' : 'Sign in'}><span className="account-label">{user ? user.username : 'Account'}</span><span className="account-icon">{user ? user.username.slice(0, 1).toUpperCase() : '↗'}</span></button>
          <button className="icon-button bag-button" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${itemCount} items`}><ShoppingBag size={19} /><span>Bag</span><b>{itemCount}</b></button>
        </div>
      </header>

      <main id="top">
        <section className="intro-band">
          <div className="intro-copy"><p className="eyebrow"><span className="eyebrow-line" /> THE EVERYDAY EDIT · VOL. 04</p><h1>Keep good<br /><em>things close.</em></h1><p className="intro-description">Useful things, made with intention.<br />A collection for the spaces you call yours.</p><a href="#catalog" className="text-link">Explore the collection <ArrowRight size={15} /></a></div>
          <div className="intro-image-wrap"><img className="intro-image" src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=88" alt="Warm, considered living room with natural textures" /><div className="image-note"><span>01 / 04</span><span>Objects for slower mornings</span></div><div className="round-stamp"><Leaf size={18} /><span>MADE TO<br />BE KEPT</span></div></div>
          <div className="intro-index">EST.<br />20<br />24</div>
        </section>

        <section className="catalog" id="catalog">
          <div className="catalog-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> THE COLLECTION</p><h2>Find your <em>everyday.</em></h2></div><div className="catalog-count">{visibleProducts.length.toString().padStart(2, '0')} <span>objects to love</span></div></div>
          <div className="shop-layout">
            <aside className="filters" aria-label="Product filters"><div className="filter-top"><span>Browse by</span><SlidersHorizontal size={15} /></div><div className="category-list">{categories.map((item) => <button key={item} className={category === item ? 'category-option active' : 'category-option'} onClick={() => setCategory(item)}><span>{item}</span><span className="category-arrow">↗</span></button>)}</div><div className="filter-note"><div className="filter-note-icon"><Leaf size={18} /></div><p>Less, but better.<br /><span>Considered pieces, made to last.</span></p></div></aside>
            <div className="product-area">
              <div className="toolbar"><label className="search-field"><Search size={16} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" aria-label="Search products" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label><label className="sort-field"><ArrowDownUp size={14} /><span>Sort</span><select aria-label="Sort products" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={13} /></label></div>
              {loading && <div className="empty-state">Gathering the good things…</div>}
              {error && <div className="empty-state"><p>{error}</p><button className="text-link" onClick={() => window.location.reload()}>Try again <ArrowRight size={14} /></button></div>}
              {!loading && !error && visibleProducts.length === 0 && <div className="empty-state">Nothing here just yet. Try another search.</div>}
              <div className="product-grid">{visibleProducts.map((product, index) => <article className="product-card" key={product.id} style={{ '--delay': `${index * 55}ms` }}><div className="product-photo-wrap"><img className="product-photo" src={product.image_url} alt={product.name} loading="lazy" /><span className="product-tag">{product.featured ? 'THE EDIT' : product.category.toUpperCase()}</span><button className="favorite-button" aria-label={`Save ${product.name}`} onClick={(event) => event.currentTarget.classList.toggle('is-saved')}><Heart size={17} /></button><button className="quick-add" onClick={() => { updateCart(product.id, 1); setNotice('Added to your bag'); window.setTimeout(() => setNotice(''), 1800) }}><Plus size={14} /> Add to bag</button></div><div className="product-details"><div><h3>{product.name}</h3><p>{product.category} · Small-batch pick</p></div><strong>{money.format(Number(product.price))}</strong></div></article>)}</div>
            </div>
          </div>
        </section>
        <section className="closing-strip"><span>GOOD THINGS, WELL MADE</span><div><span>For you, and the everyday.</span><span>For you, and the everyday.</span></div><span>FIELD & FORM © 2026</span></section>
      </main>

      {notice && <div className="toast" role="status"><Check size={15} /> {notice}</div>}
      {cartOpen && <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}><aside className="side-panel"><div className="panel-heading"><div><p className="eyebrow">YOUR SELECTION</p><h2>Your bag <span>({itemCount})</span></h2></div><button className="close-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={20} /></button></div>{cartItems.length === 0 ? <div className="empty-bag"><ShoppingBag size={30} /><p>Your bag is taking a quiet moment.</p><button className="text-link" onClick={() => setCartOpen(false)}>Back to browsing <ArrowRight size={14} /></button></div> : <><div className="bag-items">{cartItems.map((product) => <div className="bag-item" key={product.id}><img src={product.image_url} alt="" /><div className="bag-item-info"><h3>{product.name}</h3><p>{money.format(Number(product.price))}</p><div className="quantity-control"><button onClick={() => updateCart(product.id, -1)} aria-label={`Remove one ${product.name}`}><Minus size={13} /></button><span>{cart[product.id]}</span><button onClick={() => updateCart(product.id, 1)} aria-label={`Add one ${product.name}`}><Plus size={13} /></button></div></div><strong>{money.format(Number(product.price) * cart[product.id])}</strong></div>)}</div><div className="bag-footer"><div className="subtotal-row"><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="checkout-button" onClick={() => { setCartOpen(false); if (!user) { setAuthMode('login'); setAuthOpen(true) } else setNotice('Checkout is ready to connect to your payment provider.') }}>Continue to checkout <ArrowRight size={16} /></button><button className="continue-link" onClick={() => setCartOpen(false)}>Continue exploring</button></div></>}</aside></div>}
      {authOpen && <div className="overlay modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setAuthOpen(false)}><section className="auth-modal"><button className="close-button auth-close" onClick={() => setAuthOpen(false)} aria-label="Close"><X size={19} /></button><p className="eyebrow">FIELD & FORM · YOUR ACCOUNT</p><h2>{authMode === 'login' ? 'Welcome back.' : 'Make yourself at home.'}</h2><p className="auth-subtitle">{authMode === 'login' ? 'Sign in to keep your good things close.' : 'Create an account for a more personal shop.'}</p><form className="auth-form" onSubmit={handleAuth}>{authMode === 'signup' && <label>Username<input name="username" required autoComplete="username" placeholder="Pick a username" /></label>}{authMode === 'login' && <label>Email or username<input name="username" required autoComplete="username" placeholder="you@example.com" /></label>}{authMode === 'signup' && <label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>}<label>Password<input name="password" type="password" minLength="8" required autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" /></label><button className="checkout-button" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button></form><p className="auth-switch">{authMode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>{authMode === 'login' ? 'Create an account' : 'Sign in'}</button></p></section></div>}
    </div>
  )
}

export default App
