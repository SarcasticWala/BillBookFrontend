import { toast } from "react-toastify";
import godownImg from "../../../public/assets/godwon.jpg";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";

const Godown = () => {
  const handleEnableClick = () => {
    // Godown/warehouse management is not yet available (needs backend support).
    toast.info("Godown management is coming soon");
  };

  return (
    <div className="secondary-font p-4 sm:p-6">
      <h1 className="text-lg sm:text-xl primary-font text-gray-900 mb-4 sm:mb-6">Godown Management</h1>

      <Card className="p-6 sm:p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src={godownImg}
            alt="Godown Illustration"
            className="w-80 max-w-full h-auto mb-6"
          />
          <h2 className="text-lg primary-font text-gray-900 mb-2">
            Start managing multiple Godowns!
          </h2>
          <p className="text-gray-600 text-sm max-w-xl mb-6 light-font">
            You can easily monitor and track your inventory across various Godowns and Store locations
          </p>
          <Button variant="primary" size="lg" onClick={handleEnableClick}>
            Enable Godown
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Godown;
