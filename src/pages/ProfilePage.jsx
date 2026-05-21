import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, orderService } from '../services/api';
import { 
  User as UserIcon, 
  ShoppingBag, 
  LogOut, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  PackageCheck
} from 'lucide-react';

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

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState(null);
  
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync profile details and get order history on mount
  useEffect(() => {
    if (!user) {
      navigate('/login?returnTo=profile');
      return;
    }

    setPageLoading(true);
    Promise.all([
      authService.getProfile(),
      orderService.getHistory(user.id)
    ])
      .then(([profileRes, ordersRes]) => {
        const u = profileRes.data;
        setProfileData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || ''
        });
        setOrders(ordersRes.data || []);
        setPageLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching details:', err);
        setError('Could not fully synchronize account details. Showing cached info.');
        // Fallback to cached context user info
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        });
        // Fetch order history separately in case profile failed
        orderService.getHistory(user.id)
          .then((res) => {
            setOrders(res.data || []);
          })
          .catch((e) => console.error('Order history failed too:', e))
          .finally(() => setPageLoading(false));
      });
  }, [user, navigate]);

  const handleUpdateField = (key) => (e) => {
    setProfileData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setFormError(null);
    setSuccessMsg(null);
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address
      });
      setSuccessMsg('Your studio profile details have been saved successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setFormError(err.message || 'Unable to update details at this time.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const requestCancelOrder = (orderId) => {
    setCancelConfirmOrderId(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!cancelConfirmOrderId) return;
    
    const orderId = cancelConfirmOrderId;
    setCancellingOrderId(orderId);
    setCancelConfirmOrderId(null);
    
    try {
      await orderService.cancel(orderId, user.id);
      // Fetch fresh orders
      const ordersRes = await orderService.getHistory(user.id);
      setOrders(ordersRes.data || []);
      setSuccessMsg(`Order #${orderId} has been successfully cancelled.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel the order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cancelled':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded bg-red-50 text-red-600 border border-red-100">
            <XCircle size={12} /> Cancelled
          </span>
        );
      case 'Delivered':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded bg-green-50 text-emerald-600 border border-green-100">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded bg-amber-50 text-amber-600 border border-amber-100">
            <PackageCheck size={12} /> Shipped
          </span>
        );
      case 'Confirmed':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-600 border border-blue-100">
            <Clock size={12} /> Confirmed
          </span>
        );
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-stone border-t-ochre rounded-full animate-spin" />
          <span className="text-[0.65rem] tracking-[0.2em] font-sans text-charcoal/40 uppercase font-bold">Synchronizing...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="px-8 md:px-16 py-12 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)] flex flex-col bg-cream"
    >
      {/* Page Header */}
      <div className="mb-12 border-b border-stone pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-ochre font-sans font-bold mb-3">
            Studio Members Space
          </p>
          <h1 className="text-4xl font-serif text-charcoal">
            My Profile
          </h1>
        </div>
        <div className="flex flex-col md:items-end gap-1 font-sans text-xs text-charcoal/60">
          <div>Logged in as: <strong className="text-charcoal font-semibold">{profileData.email}</strong></div>
        </div>
      </div>

      {/* Global Banner Notification */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border-l-[3px] border-emerald-500 px-4 py-3 text-emerald-800 text-sm font-sans mb-8 flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {error && (
        <div className="bg-amber-50 border-l-[3px] border-amber-500 px-4 py-3 text-amber-800 text-sm font-sans mb-8 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT COLUMN: Profile Info & Update Form */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-2xl p-8 border border-stone/20 shadow-xs flex flex-col gap-6">
            
            <div className="flex items-center gap-3 pb-4 border-b border-stone/40">
              <UserIcon size={18} className="text-ochre" />
              <h2 className="text-lg font-serif text-charcoal">Personal Details</h2>
            </div>

            {formError && (
              <div className="bg-red-50 border-l-[3px] border-red-500 px-3 py-2 text-red-900 text-xs font-sans">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div>
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/50 font-sans font-bold mb-1.5">
                  Full Name
                </label>
                <input
                  type="text" 
                  required 
                  value={profileData.name} 
                  onChange={handleUpdateField('name')}
                  className="w-full bg-transparent border-b border-stone/60 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-ochre transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/50 font-sans font-bold mb-1.5">
                  Email (Cannot be modified)
                </label>
                <div className="flex items-center gap-2 text-sm font-sans text-charcoal/50 py-1.5 border-b border-stone/20 select-none">
                  <Mail size={14} className="opacity-70" />
                  <span>{profileData.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/50 font-sans font-bold mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="tel" 
                    value={profileData.phone} 
                    onChange={handleUpdateField('phone')}
                    placeholder="e.g. 0300-1234567"
                    className="w-full bg-transparent border-b border-stone/60 py-1.5 pl-6 text-sm font-sans text-charcoal focus:outline-none focus:border-ochre transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/50 font-sans font-bold mb-1.5">
                  Shipping Address
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-0 top-2.5 text-charcoal/40" />
                  <textarea
                    rows={3}
                    value={profileData.address} 
                    onChange={handleUpdateField('address')}
                    placeholder="Provide your default shipping location..."
                    className="w-full bg-transparent border-b border-stone/60 py-1.5 pl-6 text-sm font-sans text-charcoal focus:outline-none focus:border-ochre transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-charcoal text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase py-3.5 mt-4 hover:bg-black transition-colors rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {updateLoading ? 'Saving...' : 'Save Profile details'}
              </button>
            </form>
          </div>

          {/* Logout Action Area */}
          <button
            onClick={handleSignOut}
            className="w-full bg-transparent border border-stone hover:border-charcoal hover:bg-white text-charcoal text-[0.7rem] tracking-[0.2em] font-bold uppercase py-3.5 transition-all rounded-lg flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>Sign out of studio</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Order History */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone/40 mb-2">
            <ShoppingBag size={18} className="text-ochre" />
            <h2 className="text-lg font-serif text-charcoal">Your Purchase History</h2>
            <span className="text-[11px] font-sans font-semibold bg-stone/40 text-charcoal px-2.5 py-0.5 rounded-full">
              {orders.length}
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {orders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-stone/20 p-12 text-center flex flex-col items-center gap-4 justify-center"
              >
                <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center text-charcoal/40">
                  <ShoppingBag size={24} />
                </div>
                <div className="max-w-md">
                  <h3 className="font-serif text-lg text-charcoal mb-2">No studio purchases found</h3>
                  <p className="text-xs font-sans text-charcoal/60 leading-relaxed mb-6">
                    You haven't ordered any high-quality creative supplies yet. Visit our shop to get inspired and begin your creative journey.
                  </p>
                  <button 
                    onClick={() => navigate('/shop')}
                    className="inline-flex items-center gap-2 bg-charcoal text-white hover:bg-ochre text-[0.7rem] tracking-[0.2em] font-bold uppercase py-3 px-6 rounded-lg transition-colors shadow-xs"
                  >
                    <span>Browse Creative Shop</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((order) => {
                  const items = order.orderItems || [];
                  const isCancellable = order.orderStatus !== 'Shipped' && 
                                       order.orderStatus !== 'Delivered' && 
                                       order.orderStatus !== 'Cancelled';
                  
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  });

                  return (
                    <motion.div
                      key={order.orderId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white rounded-2xl border border-stone/20 overflow-hidden shadow-xs hover:border-stone transition-all flex flex-col"
                    >
                      {/* Order Info Header */}
                      <div className="bg-stone/5 border-b border-stone/10 p-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] tracking-wider font-sans font-bold text-charcoal">
                              ORDER #ORD-{order.orderId}
                            </span>
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-charcoal/50 font-sans mt-0.5">
                            <Calendar size={12} className="opacity-80" />
                            <span>Placed on {orderDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-right">
                          <span className="text-[10px] tracking-wider font-sans text-charcoal/40 uppercase">Total Amount:</span>
                          <span className="text-base font-bold font-sans text-ochre">Rs.{order.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6 flex flex-col gap-4 border-b border-stone/10">
                        {items.map((item) => {
                          const p = item.product || {};
                          const cat = p.categoryName || 'Supplies';
                          const img = p.imagePath
                            ? (p.imagePath.startsWith('http') ? p.imagePath : `http://localhost:5190${p.imagePath}`)
                            : getImageForCategory(cat, p.productId);

                          return (
                            <div key={item.orderItemId} className="flex items-center gap-4 py-2 border-b border-stone/5 last:border-b-0">
                              <div className="w-14 h-14 rounded-lg bg-stone/5 border border-stone/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                                <img src={img} alt={p.productName} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold font-sans text-charcoal truncate">{p.productName || 'Creative Supply Item'}</h4>
                                <p className="text-[10px] text-charcoal/50 font-sans mt-0.5 uppercase tracking-wider">{cat}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-sans text-charcoal/60 select-none">Qty: {item.quantity}</p>
                                <p className="text-xs font-bold font-sans text-charcoal mt-0.5">Rs.{(item.price || 0).toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-6 bg-stone/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-1.5 text-xs font-sans text-charcoal/60 leading-relaxed max-w-md">
                          <MapPin size={14} className="text-charcoal/40 shrink-0 mt-0.5" />
                          <span>
                            <strong>Deliver to:</strong> {order.shippingAddress || 'No shipping address provided.'}
                          </span>
                        </div>

                        {isCancellable && (
                          <button
                            onClick={() => requestCancelOrder(order.orderId)}
                            disabled={cancellingOrderId === order.orderId}
                            className="bg-transparent border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 text-[0.65rem] tracking-[0.2em] font-bold uppercase px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 self-end sm:self-auto"
                          >
                            {cancellingOrderId === order.orderId ? (
                              <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
        
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-stone/20 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-serif text-charcoal">Cancel Order?</h2>
              <p className="text-sm font-sans text-charcoal/60 leading-relaxed mb-4">
                Are you sure you want to cancel this order? This will restore stock levels immediately and cannot be undone.
              </p>
              <div className="flex w-full gap-4 mt-2">
                <button
                  onClick={() => setCancelConfirmOrderId(null)}
                  className="flex-1 bg-stone/10 hover:bg-stone/20 text-charcoal text-[0.7rem] tracking-[0.2em] font-bold uppercase py-3.5 rounded-lg transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase py-3.5 rounded-lg transition-colors shadow-sm"
                >
                  Yes, Cancel It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
