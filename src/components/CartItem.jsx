import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus } from 'lucide-react';

export function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCart();

  const increment = () => updateQuantity(item.productId, item.quantity + 1);
  const decrement = () => {
    if (item.quantity === 1) removeItem(item.productId);
    else updateQuantity(item.productId, item.quantity - 1);
  };

  const imageUrl = item.imagePath 
    ? (item.imagePath.startsWith('http') ? item.imagePath : `http://localhost:5190${item.imagePath}`)
    : 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&q=80';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex gap-4 items-start"
    >
      {/* Product Image */}
      <div className="w-20 h-20 bg-stone/5 flex items-center justify-center rounded-xl overflow-hidden shrink-0 border border-stone/10">
        <img 
          src={imageUrl} 
          alt={item.productName} 
          className="w-full h-full object-contain p-2" 
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-sans font-bold text-[0.85rem] leading-snug text-charcoal line-clamp-2">
            {item.productName}
          </h4>
          <button 
            onClick={() => removeItem(item.productId)}
            className="text-charcoal/20 hover:text-ochre transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <p className="text-[0.65rem] tracking-[0.1em] font-bold text-charcoal/40 uppercase font-sans">
          {item.categoryName || 'Supplies'}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 border border-stone/20 rounded-lg px-2 py-1 bg-white">
            <button 
              onClick={decrement}
              className="text-charcoal/40 hover:text-charcoal transition-colors"
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <span className="text-xs font-bold font-sans min-w-[12px] text-center text-charcoal">
              {item.quantity}
            </span>
            <button 
              onClick={increment}
              className="text-charcoal/40 hover:text-charcoal transition-colors"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
          
          <span className="text-sm font-bold text-charcoal font-sans">
            Rs. {(item.price * item.quantity).toFixed(0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
