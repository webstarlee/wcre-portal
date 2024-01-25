import React from "react";
import { LoadingContainer } from "./StyledComponents";
import LoadingImg from "@/assets/images/loading.svg";

const LoadingView: React.FC = () => {
  return (
    <LoadingContainer>
      <img style={{width: "40px"}} src={LoadingImg} />
    </LoadingContainer>
  );
};

export default LoadingView;
