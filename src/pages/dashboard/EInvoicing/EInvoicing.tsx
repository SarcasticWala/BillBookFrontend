
import React from "react";
import { FiHelpCircle } from "react-icons/fi";
import { Button } from "../../../components/UI/Button";

const EInvoicingPage = () => {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
            <div >
            
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-xl primary-font  text-gray-800">e-Invoicing</h1>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                        <FiHelpCircle className="text-lg " /> What is e-Invoicing
                    </Button>
                </div>

             
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        title="Automatic e-invoice generation"
                        imageSrc="/assets/e_invoicing_onboading_1.svg"
                    />
                    <FeatureCard
                        title="Hassle e-way bill generation using IRN"
                        imageSrc="/assets/e_invoicing_onboading_2.svg"
                    />
                    <FeatureCard
                        title="Easy GSTR1 reconciliation"
                        imageSrc="/assets/e_invoicing_onboading_3.svg"
                    />

                </div>

          
                <div className="mt-10 text-center">
                    <p className="text-gray-600 text-2xl mb-4">
                        Try India's easiest and fastest e-invoicing solution today
                    </p>
                    <Button className="w-full primary-font sm:w-auto cursor-pointer ">
                        Start Generating e-Invoices
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface FeatureCardProps {
    title: string;
    imageSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, imageSrc }) => {
    return (
        <div className="bg-gray-50 px-15 py-24 rounded-md border border-gray-200 shadow-sm text-center hover:shadow-md transition">
            <div className="flex justify-center mb-4">
                <img
                    src={imageSrc}
                    alt={title}
                    className="h-24 w-24 object-contain"
                />
            </div>
            <div className="text-sm font-medium text-gray-700">{title}</div>
        </div>
    );
};


export default EInvoicingPage;
