import axios from "../api/axios";
import { useAuthContext } from "../context/AuthProvider";
import useAxiosPrivate from "./useAxiosPrivate";

const useLogout = () => {
  const { setAuth } = useAuthContext();
  const axiosPrivate = useAxiosPrivate();

  const logout = async () => {
    setAuth({});
    try {
      await axiosPrivate.post(
        "/auth/jwt/logout/",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
