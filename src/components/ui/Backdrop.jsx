function Backdrop({ children, onCloseBackdrop }) {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-30 p-8"
      onClick={onCloseBackdrop}
    >
      {children}
    </div>
  );
}

export default Backdrop;
