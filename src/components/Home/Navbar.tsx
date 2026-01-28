import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../UI/Button";
const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
       
        <div className="text-indigo-700  primary-font text-4xl">
          <span >BillBook</span>
          <span className="text-black ">Software</span>
        </div>

       
        <div className="flex items-center space-x-4 primary-font">
          <Button
            onClick={() => navigate("/login")}

          >
            Login
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
