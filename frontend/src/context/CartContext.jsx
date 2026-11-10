import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    deliveryFee: 0,
    totalAmount: 0,
    couponApplied: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 0,
        couponApplied: null,
      });
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await API.post('/cart/items', { productId, quantity });
      if (data.success) {
        setCart(data.cart);
        return { success: true, message: data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add item to cart',
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await API.put(`/cart/items/${productId}`, { quantity });
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update quantity',
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await API.delete(`/cart/items/${productId}`);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove item',
      };
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await API.post('/cart/apply-coupon', { code });
      if (data.success) {
        await fetchCart();
        return { success: true, message: data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code',
      };
    }
  };

  const clearCartState = () => {
    setCart({
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      totalAmount: 0,
      couponApplied: null,
    });
  };

  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        fetchCart,
        clearCartState,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
