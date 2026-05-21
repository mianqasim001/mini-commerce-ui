import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { WishlistProvider } from './context/WishlistContext';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"           element={<HomePage />} />
        <Route path="/shop"       element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/wishlist"   element={<WishlistPage />} />
        <Route path="/login"      element={<AuthPage />} />
        <Route path="/signup"     element={<AuthPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
        <Route path="/checkout"   element={<CheckoutPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen bg-cream flex flex-col">
              <Navbar />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <footer className="bg-charcoal text-white pt-16 pb-8 px-8 md:px-12 font-sans border-t border-stone/10 mt-auto">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
                  <div className="col-span-1 md:col-span-1">
                    <h3 className="text-xl font-serif tracking-widest mb-4 flex items-center gap-3">
                      <span>ART EFFECT</span>
                      <span className="w-6 h-[1px] bg-ochre inline-block" />
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed max-w-[200px]">
                      Premium studio supplies crafted for the modern creative. High quality, hand-packed in our Brooklyn studio.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-5 text-white/80">Explore</h4>
                    <ul className="flex flex-col gap-3 text-white/50 text-xs">
                      <li className="hover:text-ochre cursor-pointer transition-colors">Paints & Mediums</li>
                      <li className="hover:text-ochre cursor-pointer transition-colors">Brushes & Tools</li>
                      <li className="hover:text-ochre cursor-pointer transition-colors">Canvas & Surfaces</li>
                      <li className="hover:text-ochre cursor-pointer transition-colors">Drawing & Sketching</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-5 text-white/80">Support</h4>
                    <ul className="flex flex-col gap-3 text-white/50 text-xs">
                      <li className="hover:text-ochre cursor-pointer transition-colors">Shipping & Returns</li>
                      <li className="hover:text-ochre cursor-pointer transition-colors">Contact Us</li>
                      <li className="hover:text-ochre cursor-pointer transition-colors">Order Tracking</li>
                      <li className="hover:text-ochre cursor-pointer transition-colors">FAQ</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-5 text-white/80">The Studio Letter</h4>
                    <p className="text-white/50 text-xs mb-4 leading-relaxed">Join our mailing list for studio insights, early access, and creative inspiration.</p>
                    <div className="flex w-full">
                      <input 
                        type="email" 
                        placeholder="Email address" 
                        className="bg-white/5 border border-white/10 px-4 py-3 text-xs text-white w-full focus:outline-none focus:border-ochre transition-colors rounded-l-lg" 
                      />
                      <button className="bg-ochre px-4 py-3 text-white text-xs font-bold hover:bg-white hover:text-charcoal transition-colors rounded-r-lg">
                        →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[10px] text-white/40 tracking-wider">
                  <p>© 2025 ART EFFECT STUDIO. ALL RIGHTS RESERVED.</p>
                  <div className="flex gap-6 mt-4 md:mt-0">
                    <span className="hover:text-white cursor-pointer transition-colors">PRIVACY POLICY</span>
                    <span className="hover:text-white cursor-pointer transition-colors">TERMS OF SERVICE</span>
                  </div>
                </div>
              </footer>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
