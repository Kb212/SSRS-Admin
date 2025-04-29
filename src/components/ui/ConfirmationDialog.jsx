import Backdrop from "./Backdrop";

function ConfirmationDialog({
  message,
  onCancel,
  onConfirm,
  isLoading = false,
}) {
  return (
    <Backdrop onCloseBackdrop={onCancel}>
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-[400px] text-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
      >
        <p className="mb-4">{message}</p>
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

export default ConfirmationDialog;
