import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Heart, Eye, ShoppingCart } from 'lucide-react';

// Centralised helper to get high-quality images based on category
const getImageForCategory = (category, id) => {
  const images = {
    Paints: 'https://images.unsplash.com/photo-1583214711625-78e7158d4e96?w=600&q=80',
    Brushes: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    Canvas: 'https://images.unsplash.com/photo-1578301978693-85fa9c026f43?w=600&q=80',
    Canvases: 'https://images.unsplash.com/photo-1578301978693-85fa9c026f43?w=600&q=80',
    Drawing: 'https://images.unsplash.com/photo-1506804886640-39fb408b4798?w=600&q=80',
    Tools: 'https://images.unsplash.com/photo-1518991669955-9c7e78ec80ca?w=600&q=80',
    Mediums: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=600&q=80',
    Pencils: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  };
  return images[category] || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80';
};

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate    = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);
  const [error, setError]   = useState(null);

  // Safety check: Avoid rendering if product data is unexpectedly missing
  if (!product) return null;

  // Map backend names for local use
  const id       = product.productId;
  const name     = product.productName;
  const price    = product.price;
  const stock    = product.stockQuantity;
  const category = product.categoryName || 'Supplies';
  const imageUrl = product.imagePath 
    ? (product.imagePath.startsWith('http') ? product.imagePath : `http://localhost:5190${product.imagePath}`)
    : getImageForCategory(category, id);

  const inWishlist = isInWishlist(id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAdd = async (e) => {
    e.stopPropagation(); // Prevent navigating to the product page
    
    if (stock === 0) return;
    
    setAdding(true); 
    setError(null);
    
    try {
      const result = await addItem(id, 1);
      setAdding(false);
      
      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        setError(result.error || 'Failed to add item');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setAdding(false);
      setError('An unexpected error occurred.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const safePrice = typeof price === 'number' ? price : parseFloat(price) || 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col bg-white rounded-2xl p-4 shadow-sm border border-stone/20 group cursor-pointer h-full"
      onClick={() => navigate(`/product/${id}`)}
    >
      {/* Product Image Section */}
      <div className="aspect-square relative mb-4 overflow-hidden rounded-xl bg-stone/5 flex items-center justify-center p-6">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors ${inWishlist ? 'bg-ochre text-white' : 'bg-white text-charcoal/40 hover:text-ochre'}`}
          >
            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-charcoal/40 hover:text-ochre transition-colors">
            <Eye size={16} />
          </button>
        </div>

        <div className="absolute top-2 left-2 bg-cream/90 backdrop-blur-sm px-2 py-1 shadow-xs border border-stone/10">
          <span className="text-charcoal text-[0.55rem] tracking-[0.1em] uppercase font-sans font-bold">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="font-sans text-[0.95rem] font-bold leading-snug mb-3 text-charcoal line-clamp-2">
          {name}
        </h3>
        
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            {error && <p className="text-[10px] text-red-500 font-sans mb-1">{error}</p>}
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-bold font-sans text-ochre">Rs.{safePrice.toFixed(0)}</span>
              {stock === 0 && (
                <span className="text-[10px] text-charcoal/40 font-sans uppercase tracking-wider">
                  — Out of stock
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={stock === 0 || adding}
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm
              ${stock === 0 ? 'bg-stone/20 text-charcoal/20 cursor-not-allowed'
              : added ? 'bg-ochre text-white'
              : 'bg-charcoal text-white hover:bg-ochre'}`}
          >
            {adding ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> 
             : added ? <Check size={18} strokeWidth={3} />
             : <ShoppingCart size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

