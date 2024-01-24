import React from "react";
import { Button } from "@mui/material";

interface LeeButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const LeeButton: React.FC<LeeButtonProps> = ({onClick, children}) => {
  return (
    <Button onClick={onClick}>
      {children}
    </Button>
  );
};

export default LeeButton;
