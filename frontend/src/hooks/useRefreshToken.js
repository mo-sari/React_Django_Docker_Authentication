import axios from "../api/axios";
import { useAuthContext } from "../context/AuthProvider";

const useRefreshToken = () => {
  const { setAuth } = useAuthContext();

  const refresh = async () => {
    const response = await axios.post(
      "auth/jwt/refresh/",
      {},
      {
        withCredentials: true,
      }
    );
    setAuth((prev) => {
      console.log(JSON.stringify(prev));
      console.log(response.data.access);
      return {
        ...prev,
        accessToken: response.data.access,
        refreshToken: response.data.refresh,
      };
    });
    return response.data.access;
  };
  return refresh;
};

export default useRefreshToken;
