import { createContext, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";

const AuthContext = createContext();

function normalizeUser(rawUser) {
 if (!rawUser) return null;

 return {
   id: rawUser.id || rawUser._id || "",
   name: rawUser.name || "",
   email: rawUser.email || "",
   role: rawUser.role || "",
 };
}

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(localStorage.getItem("token") || "");
 const [loading, setLoading] = useState(true);

 const saveAuth = (tokenValue, userValue) => {
   const normalizedUser = normalizeUser(userValue);

   localStorage.setItem("token", tokenValue);
   localStorage.setItem("user", JSON.stringify(normalizedUser));

   setToken(tokenValue);
   setUser(normalizedUser);
 };

 const clearAuth = () => {
   localStorage.removeItem("token");
   localStorage.removeItem("user");
   setToken("");
   setUser(null);
 };

 const register = async (payload) => {
   const res = await client.post("/auth/register", payload);
   saveAuth(res.data.token, res.data.user);
   return res.data;
 };

 const login = async (payload) => {
   const res = await client.post("/auth/login", payload);
   saveAuth(res.data.token, res.data.user);
   return res.data;
 };

 const logout = () => {
   clearAuth();
 };

 const fetchMe = async () => {
   try {
     const res = await client.get("/auth/me");
     const normalizedUser = normalizeUser(res.data.user);

     localStorage.setItem("user", JSON.stringify(normalizedUser));
     setUser(normalizedUser);
   } catch (err) {
     clearAuth();
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   const storedUser = localStorage.getItem("user");

   if (token && storedUser) {
     try {
       const parsed = JSON.parse(storedUser);
       setUser(normalizeUser(parsed));
     } catch {
       clearAuth();
     }
     fetchMe();
   } else {
     setLoading(false);
   }
 }, []);

 const value = useMemo(
   () => ({
     user,
     token,
     loading,
     register,
     login,
     logout,
     setUser,
     isAuthenticated: Boolean(token && user),
   }),
   [user, token, loading]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 return useContext(AuthContext);
}
