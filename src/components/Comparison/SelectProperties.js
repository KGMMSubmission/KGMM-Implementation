import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem, Badge, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import capitalize from 'capitalize';
import Tooltip from '../Utils/Tooltip';

const DragHandle = styled.span`
    cursor:move;
    color:#A5A5A5;
    width:30px;
    text-align:center;
`;

const DragHandlePlaceholder = styled.span`
    width:30px;
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 5px!important;
    display:flex!important;
`;

class SelectProperties extends Component {

    // TODO: place this outside the component class 
    SortableHandle = sortableHandle(() => (
        <DragHandle>
            <Icon icon={faSort} />
        </DragHandle>
    ));
    
    SortableItem = SortableElement(({ value: property }) => (
        <ListGroupItemStyled>
            {property.active ? <this.SortableHandle /> : <DragHandlePlaceholder />}
            <CustomInput
                type="checkbox"
                id={`checkbox-${property.id}`}
                label={capitalize(property.label)}
                className="flex-grow-1"
                onChange={() => this.props.toggleProperty(property.id)}
                checked={property.active}
            />
            <Tooltip message="Amount of contributions" hideDefaultIcon>
                <Badge color="lightblue">{property.contributionAmount}</Badge>
            </Tooltip>
        </ListGroupItemStyled>
    ));
    
    SortableList = SortableContainer(({ items }) => {
        return (
            <ListGroup>
                {items.map((value, index) => (
                    <this.SortableItem key={`item-${index}`} index={index} value={value} />
                ))}
            </ListGroup>
        );
    });

    render() {
        return (
            <Modal isOpen={this.props.showPropertiesDialog} toggle={this.props.togglePropertiesDialog}>
                <ModalHeader toggle={this.props.togglePropertiesDialog}>Select properties</ModalHeader>
                <ModalBody>
                    <this.SortableList
                        items={this.props.properties}
                        onSortEnd={this.props.onSortEnd}
                        lockAxis="y"
                        helperClass="sortableHelper"
                        useDragHandle
                    />
                </ModalBody>
            </Modal>
        );
    }
}

SelectProperties.propTypes = {
    showPropertiesDialog: PropTypes.bool.isRequired,
    togglePropertiesDialog: PropTypes.func.isRequired,
    properties: PropTypes.array.isRequired,
    onSortEnd: PropTypes.func.isRequired,
    toggleProperty: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

export default connect(
    mapStateToProps
)(SelectProperties);