import React from 'react'
import ReactDOM from 'react-dom';
import "./Modal.scss"

/**
 * 
 * @param {*} children 
 * @returns 
 */
const Modal = ({ children, isOpen ,onClose }) => {
    
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
      </div>,
      modalRoot
    );
}

export default Modal