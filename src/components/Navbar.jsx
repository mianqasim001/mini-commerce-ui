//import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
//import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { Heart, User, ShoppingBag } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { cartCount, cartOpen, setCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-between px-12 h-[80px] border-b border-stone/20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        {/* Left: Logo */}
        <Link to="/" className="font-serif text-2xl tracking-widest text-charcoal flex items-center gap-3">
          <span>ART EFFECT</span>
          <span className="w-8 h-[2px] bg-ochre inline-block" />
        </Link>
        
        {/* Middle: Links */}
        <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <Link to="/" className={`text-[0.7rem] tracking-[0.25em] uppercase font-sans font-semibold hover:text-ochre transition-colors ${location.pathname === '/' ? 'text-charcoal' : 'text-gray-400'}`}>Home</Link>
          <Link to="/shop" className={`text-[0.7rem] tracking-[0.25em] uppercase font-sans font-semibold hover:text-ochre transition-colors ${location.pathname === '/shop' ? 'text-charcoal' : 'text-gray-400'}`}>Shop</Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-6 text-charcoal">
          <Link to="/wishlist" className="hover:text-ochre transition-colors relative">
            <Heart size={20} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-ochre text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-sans">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to={user ? "/profile" : "/login"} className="hover:text-ochre transition-colors"><User size={20} strokeWidth={1.5} /></Link>
          <button onClick={() => setCartOpen(true)} className="hover:text-ochre transition-colors relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-ochre text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-sans">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
