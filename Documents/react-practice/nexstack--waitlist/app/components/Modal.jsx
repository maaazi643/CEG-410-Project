const Modal = ({ children, open, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="absolute mt-36 mx-8 md:mx-44 md:mt-48 lg:mt-40 lg:mx-[450px] bg-white rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default Modal;
