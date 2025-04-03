
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to Dashboard page
  return <Navigate to="/dashboard" replace />;
};

export default Index;
