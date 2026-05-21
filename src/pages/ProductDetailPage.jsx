import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

// Centralised image helper in case the DB image is missing
const getImageForCategory = (category, id) => {
  const images = {
    Paints: 'https://images.unsplash.com/photo-1583214711625-78e7158d4e96?w=800&q=80',
    Brushes: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    Canvas: 'https://images.unsplash.com/photo-1578301978693-85fa9c026f43?w=800&q=80',
    Canvases: 'https://images.unsplash.com/photo-1578301978693-85fa9c026f43?w=800&q=80',
    Drawing: 'https://images.unsplash.com/photo-1506804886640-39fb408b4798?w=800&q=80',
    Tools: 'https://images.unsplash.com/photo-1518991669955-9c7e78ec80ca?w=800&q=80',
    Mediums: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=800&q=80',
    Pencils: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
  };
  return images[category] || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80';
};

export function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [qty, setQty]           = useState(1);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [added, setAdded]       = useState(false);
  const [error, setError]       = useState(null);
  const [stockLimitMsg, setStockLimitMsg] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let activeProd = null;

    productService.getById(id)
      .then(({ data }) => {
        activeProd = data;
        setProduct(data);
        return productService.getAll();
      })
      .then(({ data: allProducts }) => {
        if (activeProd && Array.isArray(allProducts)) {
          const category = activeProd.categoryName || '';
          const filtered = allProducts.filter((p) => 
            p.categoryName?.toLowerCase() === category.toLowerCase() && 
            p.productId !== activeProd.productId
          );
          setRelated(filtered.slice(0, 4));
        }
      })
      .catch((e) => {
        console.error("Detail load error:", e);
        setError(e.message || 'Product not found.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!product || product.stockQuantity === 0) return;
    setAdding(true); 
    setError(null);
    
    try {
      const result = await addItem(product.productId, qty);
      setAdding(false);
      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setAdding(false);
      setError('An unexpected error occurred.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-4 border-stone/20 border-t-ochre rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 font-sans">
        <div className="bg-red-50 border-l-[3px] border-red-500 px-6 py-4 text-red-900 text-sm mb-8">
          {error || 'The requested creative tool could not be loaded.'}
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="text-sm font-bold tracking-[0.2em] uppercase text-charcoal border-b-2 border-ochre pb-1 hover:text-ochre transition-colors"
        >
          ← Back to Shop
        </button>
      </div>
    );
  }

  const stock = product.stockQuantity;
  const isOutOfStock = stock === 0;

  // Resolve product image path
  const imageUrl = product.imagePath 
    ? (product.imagePath.startsWith('http') ? product.imagePath : `http://localhost:5190${product.imagePath}`)
    : getImageForCategory(product.categoryName, product.productId);

  return (
    <motion.div
      key={`product-${id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-8 py-12 md:py-16 w-full"
    >
      
      {/* BACK TO SHOP Button */}
      <div className="mb-10">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-xs font-sans font-bold tracking-[0.25em] text-charcoal/40 hover:text-charcoal transition-colors uppercase"
        >
          ← Back to Shop
        </button>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
        
        {/* Left Column: Image wrapper */}
        <div className="w-full bg-stone/5 border border-stone/10 rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 shadow-xs">
          <img
            src={imageUrl}
            alt={product.productName}
            className="w-full h-full object-contain max-h-[500px]"
          />
        </div>

        {/* Right Column: Information Panel */}
        <div className="flex flex-col">
          
          {/* Category Tag */}
          <span className="text-ochre text-[0.7rem] tracking-[0.25em] font-sans font-bold uppercase mb-4 block">
            {product.categoryName || 'STUDIO ACCESSORY'}
          </span>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-serif text-charcoal leading-tight mb-4">
            {product.productName}
          </h1>

          {/* Price */}
          <div className="text-2xl font-bold font-sans text-charcoal">
            Rs. {product.price.toFixed(0)}
          </div>

          {/* Ochre Divider Line */}
          <div className="w-16 h-[2px] bg-ochre my-6" />

          {/* Description */}
          <p className="text-charcoal/60 leading-relaxed font-sans text-sm mb-8">
            {product.description || 'Premium artist-grade studio supply selected for elite quality and performance in raw creative workspaces.'}
          </p>

          {/* Quantity Controls & Add to Cart Button */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-4">
            
            {/* Qty Box */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between border border-stone/30 rounded-lg px-4 py-3 bg-white min-w-[120px] shrink-0 font-sans h-full">
                <button
                  type="button"
                  onClick={() => {
                    setQty(Math.max(1, qty - 1));
                    setStockLimitMsg(false);
                  }}
                  className="text-charcoal/40 hover:text-charcoal transition-colors text-lg font-medium px-2"
                  disabled={isOutOfStock}
                >
                  −
                </button>
                <span className="text-sm font-bold text-charcoal min-w-[20px] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (qty < stock) {
                      setQty(qty + 1);
                    } else {
                      setStockLimitMsg(true);
                      setTimeout(() => setStockLimitMsg(false), 2500);
                    }
                  }}
                  className="text-charcoal/40 hover:text-charcoal transition-colors text-lg font-medium px-2"
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>
              {stockLimitMsg && (
                <span className="text-[10px] text-red-500 font-sans font-bold absolute mt-14 ml-2">
                  Max stock reached
                </span>
              )}
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || adding}
              className={`flex-1 bg-charcoal text-white text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4.5 px-8 rounded-lg transition-all shadow-sm hover:bg-black flex items-center justify-center gap-3
                ${isOutOfStock ? 'bg-stone/20 text-charcoal/30 cursor-not-allowed hover:bg-stone/20' : ''}`}
            >
              {adding ? 'Adding...' : added ? 'Added ✓' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Dynamic Stock Indicator */}
          <div className="mb-8">
            {isOutOfStock ? (
              <span className="text-xs font-medium text-red-500 font-sans">✕ Out of stock</span>
            ) : stock < 5 ? (
              <span className="text-xs font-semibold text-ochre font-sans">⚠ Only {stock} items left in stock</span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 font-sans">✓ {stock} in stock ready to ship</span>
            )}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-3 border-red-500 text-red-900 text-xs font-sans">
              {error}
            </div>
          )}

          {/* Premium Details Table Grid */}
          <div className="border-t border-stone/20 font-sans text-xs mt-4">
            
            {/* Row 1 */}
            <div className="flex justify-between py-4 border-b border-stone/10">
              <span className="text-charcoal/40 font-medium">Free shipping</span>
              <span className="text-charcoal/80 font-semibold">Orders over $75</span>
            </div>

            {/* Row 2 */}
            <div className="flex justify-between py-4 border-b border-stone/10">
              <span className="text-charcoal/40 font-medium">Hand-packed</span>
              <span className="text-charcoal/80 font-semibold">In our Brooklyn studio</span>
            </div>

            {/* Row 3 */}
            <div className="flex justify-between py-4 border-b border-stone/10">
              <span className="text-charcoal/40 font-medium">Returns</span>
              <span className="text-charcoal/80 font-semibold">Within 30 days</span>
            </div>
          </div>

        </div>
      </div>

      {/* RELATED PRODUCTS SECTION */}
      {related.length > 0 && (
        <div className="border-t border-stone/20 pt-16">
          <h2 className="text-2xl font-serif text-charcoal mb-10 text-center md:text-left">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {related.map((prod) => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}
