import React from 'react';
import { Tooltip as ReactstrapTooltip } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { guid } from '../../utils';

class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        this.state = {
            tooltipOpen: false
        };

        this.id = `tooltip-${guid()}`; // generate ID to connect the tooltip with the text 
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    render() {  
        return (
            <span>
                <span id={this.id}>
                    {this.props.children} {!this.props.hideDefaultIcon ? <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" /> : ''}
                </span>

                <ReactstrapTooltip delay={{show:0,hide:0}} 
                    placement="top" 
                    isOpen={this.state.tooltipOpen} 
                    target={this.id} 
                    toggle={this.toggle}>
                    {this.props.message}
                </ReactstrapTooltip>
            </span>
        );
    }
}

Tooltip.propTypes = {
    children: PropTypes.node,
    message: PropTypes.string.isRequired,
    hideDefaultIcon: PropTypes.bool,
}

Tooltip.defaultProps = {
    hideDefaultIcon: false,
}

export default Tooltip;