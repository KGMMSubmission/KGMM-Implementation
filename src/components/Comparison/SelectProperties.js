import { Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem, Badge, Input, Label, FormGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import capitalize from 'capitalize';
import Tooltip from 'components/Utils/Tooltip';

const DragHandle = styled.span`
    cursor: move;
    color: #a5a5a5;
    width: 30px;
    text-align: center;
    flex-shrink: 0;
`;

const DragHandlePlaceholder = styled.span`
    width: 30px;
    flex-shrink: 0;
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 5px !important;
    display: flex !important;
`;

function SelectProperties(props) {
    const SortableHandle = sortableHandle(() => (
        <DragHandle>
            <Icon icon={faSort} />
        </DragHandle>
    ));

    const SortableItem = SortableElement(({ value: property }) => (
        <ListGroupItemStyled>
            {property.active ? <SortableHandle /> : <DragHandlePlaceholder />}
            <FormGroup check className="flex-grow-1">
                <Input type="checkbox" id={`checkbox-${property.id}`} onChange={() => props.toggleProperty(property.id)} checked={property.active} />{' '}
                <Label check for={`checkbox-${property.id}`} className="mb-0">
                    {capitalize(property.label)}
                </Label>
            </FormGroup>
            <Tooltip message="Amount of contributions" hideDefaultIcon>
                <Badge color="light">{property.contributionAmount}</Badge>
            </Tooltip>
        </ListGroupItemStyled>
    ));

    const SortableList = SortableContainer(({ items }) => {
        return (
            <ListGroup>
                {items.map((value, index) => (
                    <SortableItem key={`item-${index}`} index={index} value={value} />
                ))}
            </ListGroup>
        );
    });

    return (
        <Modal isOpen={props.showPropertiesDialog} toggle={props.togglePropertiesDialog}>
            <ModalHeader toggle={props.togglePropertiesDialog}>Select properties</ModalHeader>
            <ModalBody>
                <SortableList items={props.properties} onSortEnd={props.onSortEnd} lockAxis="y" helperClass="sortableHelper" useDragHandle />
            </ModalBody>
        </Modal>
    );
}

SelectProperties.propTypes = {
    showPropertiesDialog: PropTypes.bool.isRequired,
    togglePropertiesDialog: PropTypes.func.isRequired,
    properties: PropTypes.array.isRequired,
    onSortEnd: PropTypes.func.isRequired,
    toggleProperty: PropTypes.func.isRequired
};

export default SelectProperties;
