
import React from "react";
import { FiHelpCircle } from "react-icons/fi";
import { Button } from "../../../components/UI/Button";

const AutomatedBillsPage = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
      <div>
   
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl primary-font  text-gray-800">Automated Bills</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <FiHelpCircle className="text-lg" /> What is Automated Bills
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Creating repeated bills?"
            description="Automate sending of repeat bills based on a schedule of your choice"
            imageSrc="/assets/index_placeholder_second.svg"
          />
          <FeatureCard
            title="Automated Billing"
            description="Send SMS reminders to customers daily/weekly/monthly"
            imageSrc="/assets/index_placeholder_third.svg"
          />
          <FeatureCard
            title="Easy Reminders & Payment"
            description="Automatically receive notifications and collect payments"
            imageSrc="/assets/autoMatedBill_1.svg"
          />
        </div>_1

    
        <div className="mt-10 text-center">
          <p className="text-gray-600 text-xl mb-4">
            Schedule your repeated bills hassle-free
          </p>
          <Button className="w-full sm:w-auto primary-font cursor-pointer">
            Create Automated Bill
          </Button>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, imageSrc }) => {
  return (
    <div className="bg-gray-50 px-6 py-10 rounded-md border border-gray-200 shadow-sm text-center hover:shadow-md transition">
      <div className="flex justify-center mb-6">
        <img
          src={imageSrc}
          alt={title}
          className="h-24 w-24 object-contain"
        />
      </div>
      <div className="text-base font-semibold text-gray-800 mb-2">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
};

export default AutomatedBillsPage;
