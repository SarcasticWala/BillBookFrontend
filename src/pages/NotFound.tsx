import { useNavigate } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";
import { Button } from "../components/UI/Button";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="secondary-font flex flex-col items-center justify-center text-center min-h-[60vh] px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-4xl text-primary mb-5">
        <MdErrorOutline />
      </div>
      <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 mb-3">
        404
      </span>
      <h1 className="text-2xl primary-font text-gray-900">Page not found</h1>
      <p className="text-sm light-font text-gray-500 mt-2 max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
