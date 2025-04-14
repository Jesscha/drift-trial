import React from "react";
import { Modal } from "./modal/Modal";
import { useModal } from "../hooks/useModal";

export function ModalExample() {
  const { isOpen, open, close } = useModal(false);

  // Example footer with action buttons
  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={close}
        className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          // Handle confirm action here
          close();
        }}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
      >
        Confirm
      </button>
    </div>
  );

  return (
    <div className="p-4">
      <button
        onClick={open}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
      >
        Open Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Example Modal"
        footer={modalFooter}
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            This is an example modal component for your project. You can add any
            content here.
          </p>

          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-medium text-white mb-2">Modal Features:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Close on backdrop click</li>
              <li>Close on Escape key press</li>
              <li>Customizable width sizes</li>
              <li>Optional footer for action buttons</li>
              <li>Scroll support for long content</li>
              <li>Prevents background scrolling when open</li>
            </ul>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Example input field"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
