import React, { createContext, useContext, useState } from "react";

interface RootContextType {
  drawerWidth: number;
  sideOpenM: boolean;
  selectNetworkAnchor: HTMLElement | null;
  createPrososalAnchor: HTMLElement | null;
  handleSelectNetworkAnchor: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  closeSelectNetwork: () => void;
  handleCreatePrososalAnchor: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  closeCreateProposal: () => void;
  toggleSideOpenM: () => void;
}

const RootContext = createContext<RootContextType | undefined>(undefined);

interface RootProviderProps {
  children: React.ReactNode;
}

export const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  const [drawerWidth] = useState<number>(300);
  const [sideOpenM, setSideOpenM] = useState(false);
  const [selectNetworkAnchor, setSelectNetworkAnchor] = useState<HTMLElement | null>(null);
  const [createPrososalAnchor, setCreateProposalAnchor] = useState<HTMLElement | null>(null);
  
  const handleSelectNetworkAnchor = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setSelectNetworkAnchor(event.currentTarget);
  };

  const closeSelectNetwork = () => {
    setSelectNetworkAnchor(null);
  };

  const toggleSideOpenM = () => {
    setSideOpenM((prev) => !prev);
  };

  const handleCreatePrososalAnchor = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setCreateProposalAnchor(event.currentTarget);
  };

  const closeCreateProposal = () => {
    setCreateProposalAnchor(null);
  };

  return (
    <RootContext.Provider
      value={{
        drawerWidth,
        sideOpenM,
        selectNetworkAnchor,
        createPrososalAnchor,
        handleSelectNetworkAnchor,
        closeSelectNetwork,
        handleCreatePrososalAnchor,
        closeCreateProposal,
        toggleSideOpenM
      }}
    >
      {children}
    </RootContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoot = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error("useRoot must be used within a RootProvider");
  }
  return context;
};
