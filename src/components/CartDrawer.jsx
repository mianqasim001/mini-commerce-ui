import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from './CartItem';
import { Button } from './Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function CartDrawer({ open, onClose }) {
  const { items, cartTotal, cartCount, error } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      onClose();
      navigate('/login?returnTo=checkout');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[200] backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[95vw] bg-[#FAF9F6] z-[201] flex flex-col shadow-2xl"
          >
            {/* Header - "Your Atelier" style */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone/10 bg-white">
              <div className="flex flex-col">
                <h2 className="font-serif text-2xl text-charcoal">Your Atelier</h2>
                <span className="text-[0.65rem] tracking-[0.2em] font-bold text-charcoal/40 uppercase">
                  {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>
              <button onClick={onClose}
                className="text-charcoal/40 hover:text-charcoal text-2xl leading-none transition-colors p-1">✕</button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-8 py-3 text-xs font-sans border-b border-red-100 flex items-center justify-between">
                <span>{error}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-8 py-4">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    {/* Easel Graphic */}
                    <svg viewBox="0 0 100 100" className="w-40 h-40 mb-8" stroke="currentColor" fill="none">
                      <path d="M50 20 L75 85 M50 20 L25 85 M35 85 L65 85" strokeWidth="1" stroke="#A8A29E" />
                      <rect x="42" y="40" width="16" height="12" strokeWidth="1" stroke="#B45309" />
                      <path d="M49 85 L49 90 M51 85 L51 90" strokeWidth="1" stroke="#A8A29E" />
                    </svg>

                    <h3 className="font-serif text-2xl text-charcoal mb-3">Your easel is bare</h3>
                    <p className="text-charcoal/60 text-sm leading-relaxed max-w-[240px] mb-10 font-sans">
                      Every masterpiece begins with the right tools. <br /> Start collecting yours.
                    </p>
                    
                    <button 
                      onClick={() => { onClose(); navigate('/shop'); }}
                      className="text-[0.7rem] tracking-[0.25em] font-bold text-charcoal uppercase border-b-2 border-ochre pb-1 hover:text-ochre transition-colors"
                    >
                      BROWSE THE SHOP
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {items.map((item) => <CartItem key={item.productId} item={item} />)}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-6 border-t border-stone/10 bg-white">
                <div className="flex justify-between items-baseline mb-6 font-sans">
                  <span className="text-[0.7rem] tracking-[0.1em] font-bold text-charcoal/40 uppercase">Subtotal</span>
                  <span className="text-2xl font-bold text-charcoal">Rs. {cartTotal.toFixed(0)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-charcoal text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase py-5 rounded-lg hover:bg-ochre transition-colors shadow-sm flex items-center justify-center gap-3"
                >
                  {user ? 'Proceed to Checkout' : '🔒 Login to Checkout'}
                </button>
                <p className="text-[10px] text-center text-charcoal/30 font-sans mt-4 uppercase tracking-widest">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
