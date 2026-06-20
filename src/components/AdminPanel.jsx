import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Settings, Database, Upload, CheckCircle, 
  RefreshCw, AlertCircle, Eye, LogOut, Lock
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig,
  uploadProductImage,
  migrateLocalDataToFirebase,
  db
} from '../firebase';

export default function AdminPanel({ 
  categories, 
  products, 
  onSaveCategory, 
  onDeleteCategory, 
  onSaveProduct, 
  onDeleteProduct 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  
  // Category Form State
  const [catEditing, setCatEditing] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catFormOpen, setCatFormOpen] = useState(false);
  
  // Product Form State
  const [prodEditing, setProdEditing] = useState(null);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodFormOpen, setProdFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Firebase Config State
  const [firebaseKeys, setFirebaseKeys] = useState(() => {
    const active = getFirebaseConfig();
    return active ? JSON.stringify(active, null, 2) : '';
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [migrationStatus, setMigrationStatus] = useState('');

  // --- Image Compression Helper ---
  const handleImageUpload = (file, callback) => {
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Target maximum dimensions (600x600)
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG (75% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        setIsUploading(false);
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Category Handlers ---
  const handleEditCategory = (cat) => {
    setCatEditing(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatImage(cat.imageUrl);
    setCatFormOpen(true);
  };

  const handleCreateCategoryClick = () => {
    setCatEditing(null);
    setCatName('');
    setCatDesc('');
    setCatImage('');
    setCatFormOpen(true);
  };

  const handleSaveCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName || !catDesc) {
      alert("Name and description are required.");
      return;
    }

    const catId = catEditing || `cat-${Date.now()}`;
    const newCategory = {
      id: catId,
      name: catName,
      description: catDesc,
      imageUrl: catImage || 'https://images.unsplash.com/photo-1561070791-26c113006238?w=800'
    };

    try {
      await onSaveCategory(newCategory);
      setCatFormOpen(false);
      setCatEditing(null);
    } catch (err) {
      alert("Error saving category. Check connection.");
    }
  };

  // --- Product Handlers ---
  const handleEditProduct = (prod) => {
    setProdEditing(prod.id);
    setProdCategoryId(prod.categoryId);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price || '');
    setProdImage(prod.imageUrl);
    setProdFormOpen(true);
  };

  const handleCreateProductClick = () => {
    setProdEditing(null);
    setProdCategoryId(categories[0]?.id || '');
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImage('');
    setProdFormOpen(true);
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodCategoryId || !prodDesc) {
      alert("Category, Name, and Description are required.");
      return;
    }

    const prodId = prodEditing || `prod-${Date.now()}`;
    let finalImageUrl = prodImage || 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800';

    try {
      setIsUploading(true);
      // If it's a base64 string, upload it to Firebase Storage (if configured)
      if (prodImage.startsWith('data:image/')) {
        finalImageUrl = await uploadProductImage(prodId, prodImage);
      }

      const newProduct = {
        id: prodId,
        categoryId: prodCategoryId,
        name: prodName,
        description: prodDesc,
        price: prodPrice,
        imageUrl: finalImageUrl
      };

      await onSaveProduct(newProduct);
      setProdFormOpen(false);
      setProdEditing(null);
    } catch (err) {
      alert("Error saving product. Check connections.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Firebase Config Handler ---
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(firebaseKeys);
      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error("Missing apiKey or projectId");
      }
      saveFirebaseConfig(parsed);
      setSaveStatus('success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleClearFirebase = () => {
    if (confirm("Are you sure you want to log out from Firebase Cloud DB? It will revert to Local Demo mode.")) {
      clearFirebaseConfig();
      window.location.reload();
    }
  };

  const handleMigrate = async () => {
    setMigrationStatus('loading');
    try {
      await migrateLocalDataToFirebase(db);
      setMigrationStatus('success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      setMigrationStatus('error');
    }
  };

  if (!isAuthenticated) {
    const handleLoginSubmit = (e) => {
      e.preventDefault();
      if (passwordInput === 'selvaraj123') {
        sessionStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
        setLoginError(false);
      } else {
        setLoginError(true);
      }
    };

    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '4rem 0' }}>
        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--primary-soft)', borderRadius: 'var(--radius-lg)', padding: '3rem', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>Admin Access</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Please enter passcode to unlock the management console.</p>
          
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ textAlign: 'left', position: 'relative' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  placeholder="Enter passcode"
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Eye size={16} />
                </button>
              </div>
              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={14} />
                  Incorrect password. (Try default: selvaraj123)
                </div>
              )}
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-container">
      <div className="admin-header">
        <div>
          <span className="badge" style={{ marginBottom: '0.5rem' }}>Management Console</span>
          <h1 style={{ fontSize: '2rem' }}>Control Panel</h1>
        </div>
        
        {/* Firebase Connection Status Indicator */}
        <div className={`admin-status ${isFirebaseConfigured ? 'status-cloud' : 'status-demo'}`}>
          <Database size={16} />
          {isFirebaseConfigured ? 'Connected to Firebase Cloud DB' : 'Using Local Browser Storage'}
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar tabs */}
        <aside className="admin-sidebar">
          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setProdFormOpen(false); }}
          >
            <Eye size={18} />
            Manage Products
          </button>
          
          <button 
            className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveTab('categories'); setCatFormOpen(false); }}
          >
            <Settings size={18} />
            Manage Categories
          </button>
          
          <button 
            className={`admin-tab-btn ${activeTab === 'firebase' ? 'active' : ''}`}
            onClick={() => setActiveTab('firebase')}
          >
            <Database size={18} />
            Database Settings
          </button>

          <button 
            className="admin-tab-btn"
            onClick={() => {
              sessionStorage.removeItem('admin_authenticated');
              setIsAuthenticated(false);
            }}
            style={{ marginTop: '2rem', color: '#ef4444', borderTop: '1px solid var(--gray-border)', paddingTop: '1rem', borderRadius: '0' }}
          >
            <LogOut size={18} />
            Lock Console
          </button>
        </aside>

        {/* Content area */}
        <main className="admin-content-panel">
          
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              {!prodFormOpen ? (
                <>
                  <div className="panel-header">
                    <h2 className="panel-title">All Products ({products.length})</h2>
                    <button className="btn-primary" onClick={handleCreateProductClick}>
                      <Plus size={16} />
                      Add Product
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => {
                          const cat = categories.find((c) => c.id === prod.categoryId);
                          return (
                            <tr key={prod.id}>
                              <td>
                                <img src={prod.imageUrl} alt={prod.name} width="50" height="50" />
                              </td>
                              <td style={{ fontWeight: 600 }}>{prod.name}</td>
                              <td>
                                <span className="badge-category">{cat ? cat.name : 'Unknown'}</span>
                              </td>
                              <td><strong>{prod.price || 'Contact'}</strong></td>
                              <td>
                                <div className="action-btns">
                                  <button className="btn-icon" onClick={() => handleEditProduct(prod)}>
                                    <Edit size={16} />
                                  </button>
                                  <button className="btn-icon delete" onClick={() => {
                                    if (confirm("Delete product: " + prod.name + "?")) onDeleteProduct(prod.id);
                                  }}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Add / Edit Product Form */
                <form onSubmit={handleSaveProductSubmit}>
                  <h2 className="panel-title" style={{ marginBottom: '2rem' }}>
                    {prodEditing ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-control"
                      value={prodCategoryId}
                      onChange={(e) => setProdCategoryId(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Elegant Golden Wedding Card"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price Description</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. ₹35 / card  or  ₹250 / piece"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Image</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      
                      {/* Local File Upload Box */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload from Phone/PC Gallery</label>
                        <div className={`image-upload-area ${prodImage ? 'has-image' : ''}`}>
                          {prodImage ? (
                            <>
                              <img src={prodImage} className="upload-preview" alt="Upload Preview" />
                              <div style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Image compressed successfully</div>
                            </>
                          ) : (
                            <div className="upload-placeholder">
                              <Upload size={32} />
                              <div>Select file or Drag & Drop</div>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="file-upload"
                            onChange={(e) => handleImageUpload(e.target.files[0], setProdImage)}
                          />
                          <button 
                            type="button"
                            className="btn-secondary"
                            style={{ margin: '0.5rem auto 0 auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => document.getElementById('file-upload').click()}
                          >
                            Browse Files
                          </button>
                        </div>
                      </div>

                      {/* Image URL input alternative */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or paste direct Image URL</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="e.g. https://images.unsplash.com/..."
                          value={prodImage.startsWith('data:') ? '' : prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          If uploading files, they will be auto-resized to fit localStorage / database limits.
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Description</label>
                    <textarea 
                      className="form-control"
                      placeholder="Specify material quality, minimum order quantity, envelope options, custom color options..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setProdFormOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading/Saving...' : 'Save Product'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              {!catFormOpen ? (
                <>
                  <div className="panel-header">
                    <h2 className="panel-title">Service Categories</h2>
                    <button className="btn-primary" onClick={handleCreateCategoryClick}>
                      <Plus size={16} />
                      Add Category
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Category Name</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat.id}>
                            <td>
                              <img src={cat.imageUrl} alt={cat.name} width="50" height="50" />
                            </td>
                            <td style={{ fontWeight: 600 }}>{cat.name}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{cat.description}</td>
                            <td>
                              <div className="action-btns">
                                <button className="btn-icon" onClick={() => handleEditCategory(cat)}>
                                  <Edit size={16} />
                                </button>
                                <button className="btn-icon delete" onClick={() => {
                                  if (confirm("Deleting this category will delete all its products! Continue?")) onDeleteCategory(cat.id);
                                }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Add / Edit Category Form */
                <form onSubmit={handleSaveCategorySubmit}>
                  <h2 className="panel-title" style={{ marginBottom: '2rem' }}>
                    {catEditing ? 'Edit Category' : 'Create Service Category'}
                  </h2>
                  
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Wedding Invitation Cards"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category Banner Image</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <div className={`image-upload-area ${catImage ? 'has-image' : ''}`}>
                          {catImage ? (
                            <>
                              <img src={catImage} className="upload-preview" alt="Category Preview" />
                              <div style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Image loaded</div>
                            </>
                          ) : (
                            <div className="upload-placeholder">
                              <Upload size={32} />
                              <div>Select file or Drag & Drop</div>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="cat-file-upload"
                            onChange={(e) => handleImageUpload(e.target.files[0], setCatImage)}
                          />
                          <button 
                            type="button"
                            className="btn-secondary"
                            style={{ margin: '0.5rem auto 0 auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => document.getElementById('cat-file-upload').click()}
                          >
                            Browse Files
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or paste direct Image URL</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="e.g. https://images.unsplash.com/..."
                          value={catImage.startsWith('data:') ? '' : catImage}
                          onChange={(e) => setCatImage(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Short Description</label>
                    <textarea 
                      className="form-control"
                      placeholder="A short summary of what types of prints or materials are available under this service."
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setCatFormOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Category
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: FIREBASE CONFIG */}
          {activeTab === 'firebase' && (
            <div>
              <h2 className="panel-title" style={{ marginBottom: '1rem' }}>Database Cloud Connection</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Connect this website to Firebase Firestore & Storage. Once connected, products you add or edit on this page will sync live across all browsers and devices globally.
              </p>

              <div className="settings-guide">
                <h4>How to get credentials:</h4>
                <ol>
                  <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 600 }}>Firebase Console</a> (free).</li>
                  <li>Create a project (e.g. "Lovely Prints").</li>
                  <li>In Project Settings, add a Web App.</li>
                  <li>Copy the <code>firebaseConfig</code> object. It looks like:
                    <pre style={{ backgroundColor: '#1e1b4b', color: '#f5f3ff', padding: '0.75rem', borderRadius: '4px', marginTop: '0.25rem', fontSize: '0.75rem', overflowX: 'auto' }}>
{`{
  "apiKey": "AIzaSy...",
  "authDomain": "lovely-prints.firebaseapp.com",
  "projectId": "lovely-prints",
  "storageBucket": "lovely-prints.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:1234..."
}`}
                    </pre>
                  </li>
                  <li>Paste that JSON object below and save.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveFirebaseConfig}>
                <div className="form-group">
                  <label className="form-label">Firebase Config JSON Object</label>
                  <textarea 
                    className="form-control"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '180px' }}
                    placeholder='{"apiKey": "...", "projectId": "...", ...}'
                    value={firebaseKeys}
                    onChange={(e) => setFirebaseKeys(e.target.value)}
                  />
                </div>

                {saveStatus === 'success' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1.5rem', fontWeight: 600 }}>
                    <CheckCircle size={18} />
                    Configuration saved successfully! Reloading connection...
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1.5rem', fontWeight: 600 }}>
                    <AlertCircle size={18} />
                    Invalid JSON formatting. Please check curly braces and quotes.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary">
                    Save Config & Connect
                  </button>
                  
                  {isFirebaseConfigured && (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={handleClearFirebase}
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    >
                      <LogOut size={16} />
                      Disconnect Firebase
                    </button>
                  )}
                </div>
              </form>

              {/* Data Migration Option (Local to Cloud) */}
              {isFirebaseConfigured && (
                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--gray-border)', paddingTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Cloud Migration Tool</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    If you created products locally in "Demo Mode" and want to upload them to your new Firebase Cloud database, click migrate below. This will upload all local categories/products to Firestore.
                  </p>
                  
                  {migrationStatus === 'loading' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                      <RefreshCw size={18} className="animate-spin" />
                      Migrating database contents...
                    </div>
                  )}

                  {migrationStatus === 'success' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle size={18} />
                      Migration successful! Reloading view...
                    </div>
                  )}

                  {migrationStatus === 'error' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600 }}>
                      <AlertCircle size={18} />
                      Migration failed. Please check Firestore security rules.
                    </div>
                  )}

                  {migrationStatus === '' && (
                    <button type="button" className="btn-secondary" onClick={handleMigrate}>
                      Upload Local Data to Firebase
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
