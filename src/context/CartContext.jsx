import React, {
  createContext, useContext, useReducer, useEffect, useCallback, useState
} from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const initialState = { items: [], cartTotal: 0, cartCount: 0, loading: false, error: null };

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR':   return { ...state, error: action.payload };
    case 'SET_CART':    return { 
      ...state, 
      items: action.payload.items || [], 
      cartTotal: action.payload.subtotal || 0,
      cartCount: action.payload.totalItemsCount || 0,
      loading: false 
    };
    case 'CLEAR_CART':  return { ...initialState };
    default:            return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useAuth();

  // Sync cart from backend when user changes
  useEffect(() => {
    if (user) {
      fetchCart(user.id);
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user]);

  const fetchCart = async (userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await cartService.get(userId);
      // data is a CartDto { cartId, totalItemsCount, items, subtotal, discount, total }
      dispatch({ type: 'SET_CART', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addItem = useCallback(async (productId, quantity = 1) => {
    if (!user) return { success: false, error: 'Please login to add items to cart' };
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await cartService.add(user.id, productId, quantity);
      await fetchCart(user.id);
      return { success: true };
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: e.message };
    }
  }, [user]);

  const removeItem = useCallback(async (productId) => {
    if (!user) return;
    try {
      await cartService.remove(user.id, productId);
      await fetchCart(user.id);
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [user]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!user) return;
    try {
      await cartService.update(user.id, productId, quantity);
      await fetchCart(user.id);
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [user]);

  return (
    <CartContext.Provider value={{
      ...state, addItem, removeItem, updateQuantity, cartOpen, setCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
