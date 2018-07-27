import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './index.scss';
import { hideModal } from "../redux/actions";

class ModalProvider extends Component {
  componentDidMount () {
    if (this.props.onClose) {
      window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
    }
  }

  listenKeyboard (event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.props.onClose();
    }
  }

  onOverlayClick () {
    this.props.onClose();
  }

  onDialogClick (event) {
    event.stopPropagation();
  }

  render () {
    const { showModal, children } = this.props;
    const { identifier, data } = showModal || {};
    const findChild = child => child.key === identifier;

    const shouldShowModal = identifier && children &&
          (!children.length && children.key === identifier) ||
          (children && children.length && children.filter(findChild).length > 0);

    if (!shouldShowModal) {
      return <div/>;
    }

    const child = (children.length && children.filter(findChild)[0]) || children;
    const Modal = () => React.cloneElement(child, { onClose: this.onOverlayClick.bind(this), data });

    return (
      <div>
        <div className="modal-overlay-div"/>
        <div className="modal-content-div" onClick={this.onOverlayClick.bind(this)}>
          <div className="modal-dialog-div" onClick={this.onDialogClick}>
            <Modal />
          </div>
        </div>
      </div>);
  }
}

ModalProvider.propTypes = {
  showModal: PropTypes.object.isRequired,
  children: PropTypes.array,
  onClose: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(hideModal())
});

export default connect(null, mapDispatchToProps)(ModalProvider);