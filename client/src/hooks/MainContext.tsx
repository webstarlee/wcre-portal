import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { convertApiUrl } from "@/utils/urls";
import { useAuth } from "./AuthContext";

export interface NotificationProps {
  _id: string;
  color: string;
  icon: string;
  text: string;
  timestamp: string;
  title: string;
  type: string;
  user: string;
}

interface DashboardProps {
  greetingMsg: string;
  totalDocuments: string;
  totalLeases: string;
  totalListings: string;
  totalSales: string;
  notifications: NotificationProps[] | [];
}
interface MainContextType {
  dashboard: DashboardProps | undefined;
  mainLoading: boolean;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

interface MainProviderProps {
  children: React.ReactNode;
}

export const MainProvider: React.FC<MainProviderProps> = ({ children }) => {
  const { isAuthenticated, authToken } = useAuth();
  const [mainLoading, setMainLoading] = useState<boolean>(false);
  const [dashboard, setDashboard] = useState<DashboardProps | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && !dashboard && authToken !== "") {
      fetchInitialDashboard();
    }
  }, [isAuthenticated, dashboard, authToken])

  const fetchInitialDashboard = async () => {
    setMainLoading(true);
    try {
      const response = await axios.get(convertApiUrl("dashboard"), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMainLoading(false);
      let res = response.data;
      setDashboard(res);

    } catch (error) {
      setMainLoading(false);
      console.log(error);
    }
  };

  return (
    <MainContext.Provider
      value={{
        dashboard,
        mainLoading
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMain = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMain must be used within a MainProvider");
  }
  return context;
};
