import { useMemo, useState } from 'react'
import productMark from './assets/product-mark.png'
import './App.css'

const starterProducts = [
  { id: 'PRD-1048', name: 'Everyday Backpack', category: 'Accessories', price: 128, stock: 34, description: 'Your everyday carry, thoughtfully made.', tone: 'lavender', symbol: '▱' },
  { id: 'PRD-1047', name: 'Ceramic Pour-over Set', category: 'Home & living', price: 74, stock: 18, description: 'A slower, more thoughtful morning ritual.', tone: 'peach', symbol: '◒' },
  { id: 'PRD-1046', name: 'Linen Table Throw', category: 'Home & living', price: 48, stock: 6, description: 'Easy texture for everyday living.', tone: 'sage', symbol: '▤' },
  { id: 'PRD-1045', name: 'Sculpted Glass Vase', category: 'Home & living', price: 58, stock: 0, description: 'Hand-finished glass with a soft silhouette.', tone: 'blue', symbol: '♢' },
  { id: 'PRD-1044', name: 'Woven Market Tote', category: 'Accessories', price: 42, stock: 27, description: 'Room for all the little things.', tone: 'sand', symbol: '⌑' },
  { id: 'PRD-1043', name: 'Soft Form Candle', category: 'Home & living', price: 32, stock: 12, description: 'A gentle glow for your favorite corner.', tone: 'rose', symbol: '♨' },
]

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

function getInitialProducts() {
  try {
    const savedProducts = window.localStorage.getItem('northstar-products')
    if (!savedProducts) return starterProducts

    const parsedProducts = JSON.parse(savedProducts)
    if (
      !Array.isArray(parsedProducts) ||
      parsedProducts.some((product) =>
        !product ||
        typeof product.id !== 'string' ||
        typeof product.name !== 'string' ||
        typeof product.category !== 'string' ||
        typeof product.price !== 'number' ||
        typeof product.stock !== 'number' ||
        typeof product.description !== 'string',
      )
    ) {
      throw new Error('Saved product catalog has an invalid format.')
    }
    return parsedProducts
  } catch (error) {
    console.error('Unable to load saved products.', error)
    return starterProducts
  }
}

function ProductTile({ product, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`product-tile${selected ? ' selected' : ''}`}
      onClick={() => onSelect(product)}
      aria-pressed={selected}
    >
      <span className={`product-art ${product.tone}`} aria-hidden="true">
        <span>{product.symbol}</span>
        <i />
      </span>
      <span className="tile-info">
        <strong>{product.name}</strong>
        <small>{product.id} <i>·</i> {product.category}</small>
        <span className="tile-price">{formatPrice(product.price)} <small>·</small> {product.stock} in stock</span>
        {product.description && <span className="tile-description">{product.description}</span>}
      </span>
      <span className="tile-chevron" aria-hidden="true">{selected ? '✓' : '›'}</span>
    </button>
  )
}

function App() {
  const [products, setProducts] = useState(getInitialProducts)
  const [selectedProductId, setSelectedProductId] = useState(starterProducts[0].id)
  const [form, setForm] = useState({ ...starterProducts[0] })
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState('')

  const selectedProduct = products.find((product) => product.id === selectedProductId)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) =>
      [product.name, product.id, product.category].some((value) => value.toLowerCase().includes(query)),
    )
  }, [products, search])

  function selectProduct(product) {
    setSelectedProductId(product.id)
    setForm({ ...product })
    setNotice('')
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setNotice('')
  }

  function saveProduct(event) {
    event.preventDefault()
    if (!selectedProduct) return

    const updatedProduct = {
      ...selectedProduct,
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    }
    const updatedProducts = products.map((product) =>
      product.id === selectedProduct.id ? updatedProduct : product,
    )

    try {
      window.localStorage.setItem('northstar-products', JSON.stringify(updatedProducts))
      setStorageError('')
    } catch (error) {
      setStorageError('Changes are shown for this session, but could not be saved in this browser.')
      console.error('Unable to save product catalog.', error)
    }

    setProducts(updatedProducts)
    setNotice(`${updatedProduct.name} was updated.`)
  }

  function resetForm() {
    if (selectedProduct) setForm({ ...selectedProduct })
    setNotice('')
  }

  const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0)

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="#products" aria-label="Goodthings home">
          <span className="brand-mark"><img src={productMark} alt="" /></span>
          <span>goodthings<span>.</span></span>
        </a>
        <div className="workspace-picker">
          <span className="workspace-avatar">G</span>
          <span><strong>Goodthings Studio</strong><small>Store workspace</small></span>
          <i>⌄</i>
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a href="#overview" className="nav-link"><span>⌂</span> Overview</a>
          <a href="#orders" className="nav-link"><span>▤</span> Orders <small>12</small></a>
          <a href="#products" className="nav-link active"><span>◇</span> Products <small>{products.length}</small></a>
          <a href="#customers" className="nav-link"><span>♙</span> Customers</a>
          <a href="#analytics" className="nav-link"><span>↗</span> Analytics</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-mark">✳</span>
            <strong>Good things grow here.</strong>
            <p>Your catalog is looking lovely.</p>
            <a href="mailto:help@goodthings.example">Visit help center ↗</a>
          </div>
          <div className="profile">
            <span className="profile-avatar">JD</span>
            <span><strong>Jamie Dawson</strong><small>Store owner</small></span>
            <button type="button" aria-label="Profile options">···</button>
          </div>
        </div>
      </aside>

      <main className="main-area" id="products">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><i>/</i><strong>Products</strong><i>/</i><strong>Edit product</strong></div>
          <div className="topbar-actions">
            <span className="top-search"><span>⌕</span><span>Search anything...</span><kbd>⌘ K</kbd></span>
            <button className="notification-button" type="button" aria-label="Notifications">♧<i /></button>
            <span className="top-avatar">JD</span>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <span className="eyebrow">YOUR STORE <i>·</i> CATALOG</span>
              <h1>Products</h1>
              <p>Keep every detail just the way you like it.</p>
            </div>
            <div className="heading-art" aria-hidden="true">
              <span />
              <img src={productMark} alt="" />
              <i>✦</i>
            </div>
          </section>

          <section className="stats-row" aria-label="Catalog summary">
            <article className="stat-card">
              <div><span>Total products</span><i className="stat-icon purple">◇</i></div>
              <strong>{products.length.toString().padStart(2, '0')}</strong>
              <small>In your catalog</small>
            </article>
            <article className="stat-card">
              <div><span>Inventory value</span><i className="stat-icon green">$</i></div>
              <strong>{formatPrice(inventoryValue)}</strong>
              <small>Based on current stock</small>
            </article>
            <article className="stat-card">
              <div><span>Selected product</span><i className="stat-icon peach">✎</i></div>
              <strong className="selected-stat">{selectedProduct ? selectedProduct.id : '—'}</strong>
              <small>{selectedProduct ? selectedProduct.category : 'Select a product to edit'}</small>
            </article>
          </section>

          <div className="editor-layout">
            <section className="catalog-panel" aria-labelledby="catalog-heading">
              <div className="catalog-header">
                <div>
                  <h2 id="catalog-heading">Your catalog <span>{filteredProducts.length}</span></h2>
                  <p>Select a product to edit its details.</p>
                </div>
                <label className="search-control">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    aria-label="Search products"
                    placeholder="Find a product..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
              <div className="product-list">
                {filteredProducts.map((product) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    selected={product.id === selectedProductId}
                    onSelect={selectProduct}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="empty-products">
                    <span>⌕</span>
                    <strong>No matching products</strong>
                    <p>Try searching for a different name or category.</p>
                  </div>
                )}
              </div>
              <div className="catalog-footer">
                <span>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products</span>
                <span><i /> Catalog is up to date</span>
              </div>
            </section>

            <section className="edit-panel" aria-labelledby="edit-heading">
              <div className="edit-panel-heading">
                <span className="edit-icon">✎</span>
                <div>
                  <span className="edit-kicker">PRODUCT DETAILS</span>
                  <h2 id="edit-heading">{selectedProduct ? 'Edit product' : 'No product selected'}</h2>
                </div>
              </div>
              {selectedProduct ? (
                <>
                  <div className="selected-product-banner">
                    <span className={`mini-art ${selectedProduct.tone}`} aria-hidden="true">{selectedProduct.symbol}</span>
                    <span><strong>{selectedProduct.name}</strong><small>{selectedProduct.id}</small></span>
                    <span className="editing-indicator"><i /> EDITING</span>
                  </div>
                  <form className="edit-form" onSubmit={saveProduct}>
                    <label className="form-field">
                      <span>Product name <b>*</b></span>
                      <input name="name" value={form.name} onChange={updateField} maxLength={60} required />
                    </label>
                    <label className="form-field">
                      <span>Category <b>*</b></span>
                      <select name="category" value={form.category} onChange={updateField} required>
                        <option value="" disabled>Choose a category</option>
                        <option>Accessories</option>
                        <option>Home &amp; living</option>
                        <option>Clothing</option>
                        <option>Stationery</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <div className="form-split">
                      <label className="form-field">
                        <span>Price <b>*</b></span>
                        <div className="price-input"><span>$</span><input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={updateField} required /></div>
                      </label>
                      <label className="form-field">
                        <span>Stock <b>*</b></span>
                        <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} required />
                      </label>
                    </div>
                    <label className="form-field">
                      <span>Description <small>OPTIONAL</small></span>
                      <textarea name="description" rows="3" maxLength={240} value={form.description} onChange={updateField} placeholder="A few words about your product..." />
                    </label>
                    {storageError && <p className="storage-warning" role="status">{storageError}</p>}
                    {notice && <p className="save-notice" role="status"><span>✓</span>{notice}</p>}
                    <div className="form-actions">
                      <button className="discard-button" type="button" onClick={resetForm}>Discard changes</button>
                      <button className="save-button" type="submit">Save changes <span>↗</span></button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="empty-editor">
                  <span>◇</span>
                  <p>Choose a product from your catalog to begin editing.</p>
                </div>
              )}
              <div className="editor-tip"><span>✦</span><p>Thoughtful product details make it easier for customers to find their new favorite.</p></div>
            </section>
          </div>

          <footer className="page-footer">
            <span>© 2026 goodthings</span>
            <span>Made for the things that make your day <i>✳</i></span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
