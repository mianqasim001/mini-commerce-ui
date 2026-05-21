import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  // Enforce authentication at this stage
  useEffect(() => {
    if (!user) {
      navigate('/login?returnTo=checkout');
    }
  }, [user, navigate]);

  // Pre-populate fields using the user's logged-in profile data
  const [formData, setFormData] = useState({
    emailOrPhone: user?.email || '',
    country: 'Pakistan',
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    address: user?.address || '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Sync state if user changes/hydrates after mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        emailOrPhone: user.email || prev.emailOrPhone,
        firstName: user.name ? user.name.split(' ')[0] : prev.firstName,
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : prev.lastName,
        address: user.address || prev.address,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.address || !formData.firstName || !formData.city) {
      setError('Please fill in all required fields (First Name, Address, and City).');
      return;
    }

    setLoading(true);
    setError(null);

    // Concatenate full address from forms
    const fullAddress = `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.postalCode ? formData.postalCode + ', ' : ''}${formData.country}`;

    try {
      await orderService.checkout(user.id, fullAddress);
      setSuccess(true);
      
      // Clear/Refresh cart state via simple window reload or redirect
      setTimeout(() => {
        // Redirect to profile page where the orders list will load the new Confirmed order
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  // Fixed shipping rate matching the user image
  const shippingRate = 350;
  const grandTotal = cartTotal + shippingRate;

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-serif text-charcoal">
        Loading checkout workspace...
      </div>
    );
  }

  // Handle empty cart gracefully
  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[70vh] bg-cream flex flex-col items-center justify-center px-8 font-sans text-center">
        <h2 className="font-serif text-3xl text-charcoal mb-4">Your cart is empty</h2>
        <p className="text-charcoal/60 text-sm max-w-xs mb-8">
          You cannot checkout with an empty cart. Visit our creative shop to find premium supplies.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-charcoal text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase px-8 py-4 hover:bg-ochre transition-colors"
        >
          Browse Creative Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-charcoal flex flex-col lg:flex-row border-t border-stone/10">
      
      {/* LEFT COLUMN: Customer Forms */}
      <div className="flex-1 px-8 md:px-16 py-12 lg:py-16 max-w-3xl mx-auto w-full border-r border-stone/10">
        <div className="flex items-center gap-2 mb-10 text-[0.7rem] font-sans font-medium tracking-[0.1em] text-charcoal/40 uppercase">
          <span>Cart</span>
          <span>&gt;</span>
          <span className="text-charcoal font-semibold">Information</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-sans">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-sans font-medium">
            ✓ Order placed successfully! Directing you to your studio profile...
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-8 font-sans">
          
          {/* Contact Details */}
          <div>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-charcoal">Contact</h2>
              <span className="text-xs text-charcoal/40 font-medium">
                Logged in as <strong className="text-charcoal">{user.email}</strong>
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="Email or mobile phone number"
                className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre transition-all"
                required
              />
            </div>
            <div className="flex items-center gap-2.5 mt-3">
              <input
                type="checkbox"
                id="newsletters"
                defaultChecked
                className="w-4 h-4 accent-ochre rounded text-white focus:ring-0 cursor-pointer"
              />
              <label htmlFor="newsletters" className="text-xs text-charcoal/70 select-none cursor-pointer">
                Email me with news and offers
              </label>
            </div>
          </div>

          {/* Delivery Details */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-charcoal mb-4">Delivery</h2>
            
            <div className="space-y-4">
              {/* Country Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-charcoal/40 mb-1">Country/Region</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre cursor-pointer"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>

              {/* Name Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
                />
              </div>

              {/* Address Fields */}
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
                required
              />
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
              />

              {/* City & Code Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full md:col-span-2 bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code (optional)"
                  className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
                />
              </div>

              {/* Phone Field */}
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full bg-white border border-stone/30 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-ochre focus:border-ochre"
                required
              />
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full bg-charcoal text-white text-[0.75rem] tracking-[0.25em] font-bold uppercase py-5 rounded-md transition-all flex items-center justify-center gap-3 shadow-md hover:bg-black
                ${loading ? 'opacity-85 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing Studio Order...' : 'Complete Purchase'}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Cart Summary Panel */}
      <div className="w-full lg:w-[460px] shrink-0 bg-stone/5 px-8 md:px-12 py-12 lg:py-16 border-t lg:border-t-0 border-stone/10 flex flex-col justify-between">
        <div className="space-y-8">
          
          <h2 className="font-serif text-2xl text-charcoal tracking-tight border-b border-stone/10 pb-4">
            Order Review
          </h2>

          {/* Scrolling Cart Items List */}
          <div className="space-y-6 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => {
              const imageUrl = item.imagePath 
                ? (item.imagePath.startsWith('http') ? item.imagePath : `http://localhost:5190${item.imagePath}`)
                : 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&q=80';
              return (
                <div key={item.productId} className="flex gap-4 items-center font-sans">
                  
                  {/* Thumbnail Wrapper with Badge */}
                  <div className="relative w-16 h-16 bg-white border border-stone/10 rounded-lg flex items-center justify-center shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.productName}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="absolute -top-2 -right-2 bg-charcoal text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Item Description */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-sans font-bold text-xs text-charcoal truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[10px] text-charcoal/40 uppercase tracking-wider font-bold">
                      {item.categoryName || 'STUDIO'}
                    </p>
                  </div>

                  {/* Total price */}
                  <span className="text-xs font-bold text-charcoal shrink-0 font-sans">
                    Rs. {(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Promo code field */}
          <div className="flex gap-3 pt-4 border-t border-stone/10">
            <input
              type="text"
              placeholder="Discount code or gift card"
              className="flex-1 bg-white border border-stone/30 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-ochre font-sans"
              disabled
            />
            <button
              type="button"
              className="bg-[#EAE6DF] text-charcoal/60 px-5 py-2.5 text-xs font-bold uppercase rounded cursor-not-allowed font-sans"
              disabled
            >
              Apply
            </button>
          </div>

          {/* Totals panel */}
          <div className="space-y-3 pt-6 border-t border-stone/10 font-sans text-xs">
            <div className="flex justify-between items-baseline text-charcoal/60">
              <span>Subtotal · {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              <span className="font-bold text-charcoal">Rs. {cartTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-baseline text-charcoal/60">
              <span>Shipping</span>
              <span className="font-bold text-charcoal">Rs. {shippingRate.toFixed(0)}</span>
            </div>
            
            {/* Grand Total Row */}
            <div className="flex justify-between items-baseline pt-4 border-t border-stone/20 text-charcoal font-serif">
              <span className="text-base font-bold">Total</span>
              <div className="flex items-baseline gap-1 text-charcoal font-sans">
                <span className="text-[10px] text-charcoal/40 font-bold uppercase">PKR</span>
                <span className="text-xl font-bold">Rs. {grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Trust Seal */}
        <div className="text-[10px] text-center text-charcoal/30 font-sans mt-8 uppercase tracking-widest leading-relaxed">
          🔒 SSL SECURED CHECKOUT SYSTEM <br />
          ARTEFFECT STUDIO 2026
        </div>
      </div>
    </div>
  );
}
