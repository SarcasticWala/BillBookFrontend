import React from "react";
import { FiHelpCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";

const comingSoon = () =>
  toast.info("e-Invoicing is coming soon — we'll notify you when it's ready.");

const EInvoicingPage = () => {
    return (
        <div className="secondary-font">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-xl primary-font text-gray-900">e-Invoicing</h1>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <FiHelpCircle className="text-lg" /> What is e-Invoicing
                </Button>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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

                <div className="mt-8 sm:mt-10 text-center">
                    <p className="text-gray-700 text-xl sm:text-2xl primary-font mb-4">
                        Try India's easiest and fastest e-invoicing solution today
                    </p>
                    <Button size="lg" className="w-full sm:w-auto" onClick={comingSoon}>
                        Start Generating e-Invoices
                    </Button>
                </div>
            </Card>
        </div>
    );
};

interface FeatureCardProps {
    title: string;
    imageSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, imageSrc }) => {
    return (
        <div className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-14 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
                <img
                    src={imageSrc}
                    alt={title}
                    className="h-24 w-24 object-contain"
                />
            </div>
            <div className="text-sm secondary-font text-gray-700">{title}</div>
        </div>
    );
};

export default EInvoicingPage;
