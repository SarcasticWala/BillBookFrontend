import React from "react";
import { FiHelpCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";

const comingSoon = () =>
  toast.info("Automated Bills is coming soon — we'll notify you when it's ready.");

const AutomatedBillsPage = () => {
  return (
    <div className="secondary-font">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl primary-font text-gray-900">Automated Bills</h1>
        <Button
          variant="outline"
          className="text-primary hover:text-primary-hover"
        >
          <FiHelpCircle className="text-lg" /> What is Automated Bills
        </Button>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600 text-lg mb-4 primary-font">
            Schedule your repeated bills hassle-free
          </p>
          <Button className="w-full sm:w-auto primary-font" onClick={comingSoon}>
            Create Automated Bill
          </Button>
        </div>
      </Card>
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
    <div className="bg-slate-50 px-4 sm:px-6 py-8 sm:py-10 rounded-lg border border-gray-200 text-center transition hover:shadow-md hover:border-primary/40">
      <div className="flex justify-center mb-6">
        <img
          src={imageSrc}
          alt={title}
          className="h-24 w-24 object-contain"
        />
      </div>
      <div className="text-base primary-font text-gray-900 mb-2">{title}</div>
      <div className="text-sm text-gray-600 light-font">{description}</div>
    </div>
  );
};

export default AutomatedBillsPage;
