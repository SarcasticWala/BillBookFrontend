import React from "react";
import { Button } from "../UI/Button";

const Hero: React.FC = () => {
  return (
    <section className="relative w-full secondary-font py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
     <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 -z-10">
       
        <div className="absolute inset-0 opacity-10 [mask-image:linear-gradient(to_bottom,transparent,white)]">
          <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
      
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 opacity-30 animate-blob mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 opacity-30 animate-blob animation-delay-2000 mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 opacity-30 animate-blob animation-delay-4000 mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
     
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-black text-sm font-semibold rounded-full mb-4">
                🎉 Trusted by 1 Crore+ Businesses
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl primary-font text-black mb-6 leading-tight">
              Best <span className="text-black">Billing</span> &<br className="hidden sm:block" />
              <span className="text-black">Invoicing</span> Software
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Transform your business with India's most trusted GST billing software. 
              Handle invoicing, e-invoicing, and e-way billing with ease.
            </p>

         
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">GST Compliant</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Mobile App</span>
              </div>
            </div>

       
            <div className="flex justify-center lg:justify-start mb-8">
              <Button> Start Free Billing</Button>
            </div>

            
            <div className="flex items-center justify-center lg:justify-start text-sm text-gray-600">
              Paid plans starting from <span className="font-bold text-indigo-600 ml-1">₹33/month</span>
            </div>
          </div>

          
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 animate-pulse delay-75"></div>
              <div className="absolute inset-8 rounded-full bg-white/80 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Invoicing</h3>
                  <p className="text-sm text-gray-600">Generate professional invoices in seconds</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center animate-bounce delay-150">
                <span className="text-white text-xl">💰</span>
              </div>
              <div className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl shadow-lg flex items-center justify-center animate-bounce delay-300">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>
          </div>
        </div>

  
        <div className="mt-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="text-indigo-600">#</span> One software for<br />
            All your business needs
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A Complete GST Billing & Business Management Software. Designed & developed for the amazing small & medium businesses of India!
          </p>
          <div className="inline-flex items-center justify-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium shadow-sm">
            Made in India
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;