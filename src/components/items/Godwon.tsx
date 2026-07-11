import { toast } from "react-toastify";
import godownImg from "../../../public/assets/godwon.jpg";
import { Button } from "../UI/Button";

const Godown = () => {
  const handleEnableClick = () => {
    // Godown/warehouse management is not yet available (needs backend support).
    toast.info("Godown management is coming soon");
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl primary-font text-gray-800 mb-8">Godown Management</h1>

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
        <Button variant="primary" size="lg" onClick={handleEnableClick}>
          Enable Godown
        </Button>
      </div>
    </div>
  );
};

export default Godown;
