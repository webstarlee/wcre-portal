import axios from "axios";
import React, { createContext, useContext, useState } from "react";
import { useEffectOnce } from "./useEffectOnce";
import { convertApiUrl } from "@/utils/urls";

interface UserProps {
  username: string;
  fullname: string;
  role: string;
  user_id: string;
  avatar: string;
  token: string;
}
interface AuthContextType {
  user: UserProps | undefined;
  authToken: string;
  isAuthenticated: Boolean;
  authLoading: Boolean;
  login: (_user: UserProps) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProps | undefined>(undefined);
  const [authToken, setAuthToken] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const login = (_user: UserProps) => {
    setUser(_user);
    setIsAuthenticated(true);

    sessionStorage.setItem("authToken", _user.token);
    setAuthToken(_user.token);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1);
    const cookieValue =
      encodeURIComponent(_user.token) + expirationDate.toUTCString();
    document.cookie = "authToken=" + cookieValue + "; path=/";
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(undefined);
    setAuthToken("");
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.removeItem("accessToken");
  };

  useEffectOnce(() => {
    const cookieAuthToken = getCookie("authToken");
    setIsAuthenticated(!!cookieAuthToken);
    if (!!cookieAuthToken) {
      const _authToken = sessionStorage.getItem("authToken");
      if (!!_authToken) {
        setAuthToken(_authToken);
        fetchInitialUser(_authToken);
      } else {
        logout();
      }
    }
  });

  const fetchInitialUser = async (_authToken: string) => {
    setAuthLoading(true);
    try {
      const response = await axios.get(convertApiUrl("info"), {
        headers: { Authorization: `Bearer ${_authToken}` },
      });
      setAuthLoading(false);
      let _user = response.data;
      _user.token = _authToken;
      setUser(_user);
    } catch (error) {
      setAuthLoading(false);
      logout();
    }
  };

  // Function to get the value of a specific cookie
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        authLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
