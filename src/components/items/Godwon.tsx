import { useNavigate } from "react-router-dom";
import godownImg from "../../../public/assets/godwon.jpg";

const Godown = () => {
  const navigate = useNavigate();

  const handleEnableClick = () => {
    navigate("/godown/enable"); 
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Godown Management</h1>

      <div className="flex flex-col items-center justify-center text-center mt-10">
        <img
          src={godownImg}
          alt="Godown Illustration"
          className="w-80 h-auto mb-6"
        />
        <h2 className="text-lg font-semibold mb-2">
          Start managing multiple Godowns!
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mb-6">
          You can easily monitor and track your inventory across various Godowns and Store locations
        </p>
        <button
          onClick={handleEnableClick}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md shadow-sm transition"
        >
          Enable Godown
        </button>
      </div>
    </div>
  );
};

export default Godown;
