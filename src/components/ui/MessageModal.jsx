import Backdrop from "./Backdrop";

function MessageModal({ isItError, message, closeMessageBackdrop }) {
  return (
    <Backdrop onCloseBackdrop={closeMessageBackdrop}>
      <div
        className="p-10 border border-gray-300 rounded-lg bg-white shadow-lg min-w-[280px] w-[400px] text-center font-bold"
        onClick={(e) => e.stopPropagation()}
      >
        {isItError ? (
          <div className="text-red-700">{message}</div>
        ) : (
          <div className="text-green-700">{message}</div>
        )}
      </div>
    </Backdrop>
  );
}

export default MessageModal;
