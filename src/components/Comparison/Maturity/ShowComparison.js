import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesome as Icon } from '@fortawesome/react-fontawesome';
import { SortableContainer } from 'react-sortable-hoc';
import Comparison from 'components/Comparison/Comparison';
import styled from 'styled-components';
const ButtonsContainer = styled.div`
    right: 0;
    top: 20px;
    padding: 6px;
    border-radius: 6px;
    display: block;

    &.disableHover.cell-buttons {
        display: block;
    }
`;

const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
`;

function ShowComparison(props) {
    const MaturityTable = SortableContainer(({ items }) => {
        return (
            <Modal isOpen={props.ShowComparisonDialog} toggle={props.toggleShowComparisonDialog} size="lg">
                <ModalHeader toggle={props.toggleShowComparisonDialog}>Resource/ Property values for comparison: {props.title}</ModalHeader>
                <ModalBody>
                    <Comparison
                        data={props.data}
                        properties={props.properties}
                        contributions={props.contributions}
                        removeContribution={() => {}}
                        transpose={false}
                        viewDensity="compact"
                        comparisonType={props.comparisonType}
                        filterControlData={props.filterControlData}
                        updateRulesOfProperty={props.updateRulesOfProperty}
                        embeddedMode={true}
                    />
                </ModalBody>
            </Modal>
        );
    });

    return (
        <Modal isOpen={props.ShowComparisonDialog} toggle={props.toggleShowComparisonDialog}>
            <ModalHeader toggle={props.toggleShowComparisonDialog}>Maturity Review</ModalHeader>
            <ModalBody>
                <MaturityTable />
            </ModalBody>
        </Modal>
    );
}

ShowComparison.propTypes = {
    ShowComparisonDialog: PropTypes.bool.isRequired,
    toggleShowComparisonDialog: PropTypes.func.isRequired,
    data: PropTypes.string.isRequired,
    properties: PropTypes.string.isRequired,
    contributions: PropTypes.string.isRequired,
    comparisonType: PropTypes.string.isRequired,
    filterControlData: PropTypes.string.isRequired,
    updateRulesOfProperty: PropTypes.string.isRequired
};

export default ShowComparison;
