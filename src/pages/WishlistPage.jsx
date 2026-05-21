import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addItem, setCartOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAddAllToCart = async () => {
    if (!user) {
      navigate('/login?returnTo=wishlist');
      return;
    }
    
    setLoading(true);
    try {
      // Sequentially add items to ensure database cart state consistency
      for (const product of wishlist) {
        if (product.stockQuantity > 0) {
          await addItem(product.productId, 1);
        }
      }
      clearWishlist();
      setCartOpen(true);
    } catch (error) {
      console.error("Failed to add items to cart", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="max-w-[1200px] mx-auto px-8 py-16 min-h-[70vh] w-full"
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

      <h1 className="text-4xl lg:text-5xl font-serif text-charcoal mb-4 tracking-tight">Your Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-charcoal/50 font-sans text-lg mb-8 max-w-md">
            You haven't added any creative tools to your wishlist yet.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-charcoal text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase px-8 py-4 rounded hover:bg-ochre transition-all shadow-sm"
          >
            Browse Studio Shop
          </button>
        </div>
      ) : (
        <>
          <p className="text-charcoal/60 text-sm font-sans mb-12 uppercase tracking-widest font-bold">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {wishlist.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>

          <div className="flex justify-center border-t border-stone/20 pt-12">
            <button
              onClick={handleAddAllToCart}
              disabled={loading}
              className="bg-charcoal text-white text-[0.75rem] tracking-[0.25em] font-bold uppercase py-5 px-12 rounded transition-all shadow-sm hover:bg-black disabled:opacity-70 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              {loading ? 'Securing items...' : 'Add All to Cart'}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
