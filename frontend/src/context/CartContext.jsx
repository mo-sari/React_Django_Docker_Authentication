import { useState, useContext, createContext } from "react";

import CartId from "../utils/CartId";
import Toast from "../utils/Toast";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const axiosPrivate = useAxiosPrivate();

  const [cartCount, setCartCount] = useState(0);
  const [cartList, setCartList] = useState([]);
  const [stats, setStats] = useState({});

  const fetchCartList = async () => {
    try {
      const response = await axiosPrivate.get(
        `/api/course/cart-list/${CartId()}/`
      );
      setCartList(response.data);
      setCartCount(response.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCartStats = async () => {
    try {
      const response = await axiosPrivate.get(`/api/cart/stats/${CartId()}/`);
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const _add = async (formData) => {
    try {
      await axiosPrivate.post(`api/course/cart/`, formData);
      Toast().fire({
        title: "Added To Cart",
        icon: "success",
      });
      fetchCartList();
      fetchCartStats();
    } catch (err) {
      console.log(err);
    }
  };

  const addToCart = async (courseId, userId, price, country, cartId) => {
    const formdata = new FormData();

    formdata.append("course_id", courseId);
    formdata.append("user_id", userId);
    formdata.append("price", price);
    formdata.append("country_name", country);
    formdata.append("cart_id", cartId);

    _add(formdata);
  };

  const removeFromCart = async (itemId) => {
    try {
      await axiosPrivate.delete(
        `api/course/cart-item-delete/${CartId()}/${itemId}/`
      );
      fetchCartList();
      fetchCartStats();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartList,
        stats,
        fetchCartList,
        fetchCartStats,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  return useContext(CartContext);
};
