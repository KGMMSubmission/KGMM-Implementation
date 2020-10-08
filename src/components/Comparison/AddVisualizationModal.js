import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
// import styled from 'styled-components';

// TODO: investigate performance, somehow it takes way to long to render the modal (like 800ms) -- oO --

export default class AddVisualizationModal extends Component {
    constructor(props) {
        super(props);

        this.initializedData = props.initialData;
    }

    state = {};

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentDidUpdate = prevProps => {
        console.log('UPDATED');
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        // test
        const offset = 28 * 2 + 85;
        this.setState({ windowHeight: window.innerHeight - offset });
    };

    onLoadModal = () => {
        console.log('On load modal function called');
        // this.parseComparisionData();
        // // reset the selection data ;
        // this.setState({ tabSelected: 0, mappedData: undefined, mappedTableData: undefined });
    };

    render() {
        return (
            <Modal
                isOpen={this.props.showDialog}
                toggle={this.props.toggle}
                size="lg"
                onOpened={() => {
                    this.onLoadModal();
                }}
                style={{ maxWidth: '90%', marginBottom: 0 }}
            >
                <ModalHeader toggle={this.props.toggle} style={{ width: '100%' }}>
                    <div style={{ height: '60px', width: '800px' }}>
                        {/*todo : make window size adjustments! */}
                        <div style={{ width: '100%', height: '40px', paddingTop: '5px' }}>Create visualization of comparision table</div>
                        <div style={{ flexDirection: 'row', display: 'flex', flexGrow: '1' }}>SOME TABS?</div>
                    </div>
                </ModalHeader>
                <ModalBody style={{ padding: '0', minHeight: '100px', height: this.state.windowHeight }}>The Body of the modal</ModalBody>
            </Modal>
        );
    }
}

AddVisualizationModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    initialData: PropTypes.object
};

// SOME STYLE HELPER
// const TabButton = styled.div`
//     cursor: pointer;
//     color: #000000;
//     padding: 4px 20px 4px 20px;
//     border-right: 2px solid #ef8282;
//     border-radius: 10px;
//
//     background-color: #cccccc;
//     border-bottom-right-radius: 0px;
//     border-bottom-left-radius: 0px;
// `;
