import React from "react";
import { Dialog } from "@headlessui/react";
import { IoClose } from "react-icons/io5";
import { cn } from "../../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the panel. Defaults to max-w-md. */
  maxWidthClassName?: string;
}

/** Shared modal shell — one overlay, one panel style, one close button.
 *  Replaces the five hand-rolled modal wrappers across the app. */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidthClassName = "max-w-md",
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={cn(
            "w-full bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto",
            maxWidthClassName
          )}
        >
          <div className="flex items-center justify-between mb-4">
            {title && (
              <Dialog.Title className="text-lg primary-font text-gray-900">
                {title}
              </Dialog.Title>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-auto text-gray-400 hover:text-gray-600 transition"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          {children}
          {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
