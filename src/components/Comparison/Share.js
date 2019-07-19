import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Input, InputGroup, InputGroupAddon, Button, Tooltip as ReactstrapTooltip, CustomInput, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { createShortLink } from '../../network';

class Share extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showTooltipCopiedLink: false,
            shareShortLink: false,
            link: null,
            shortLink: null,
            shortLinkIsLoading: false,
            shortLinkIsFailed: false
        }

    }

    componentDidMount() {
        this.setState({ link: this.props.url });
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.url !== prevProps.url) {
            this.setState({ link: this.props.url, shortLink: null });
        }
    }

    generateShortLink = () => {
        this.setState({ shortLinkIsLoading: true, shortLinkIsFailed: false });
        createShortLink({
            long_url: this.props.url
        }).catch(() => {
            this.setState({ shortLink: null, link: this.props.url, shortLinkIsLoading: false, shortLinkIsFailed: true });
        }).then((data) => {
            let shortLink = `${window.location.protocol}//${window.location.host}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`
            this.setState({ link: shortLink, shortLink: shortLink, shortLinkIsLoading: false, shortLinkIsFailed: false });
        })
    }

    toggleShareShortLink = () => {
        if (!this.state.shareShortLink) {
            if (this.state.shortLink) {
                this.setState({ shareShortLink: true, link: this.state.shortLink })
            } else {
                this.setState({ shareShortLink: true }, () => { this.generateShortLink(); })
            }
        } else {
            this.setState({ shareShortLink: false, link: this.props.url, shortLinkIsFailed: false })
        }
    }

    toggleTooltip = (e) => {
        if (e && e.type !== 'mouseover') {
            this.setState({ showTooltipCopiedLink: !this.state.showTooltipCopiedLink });
        }
    }

    render() {
        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Share link</ModalHeader>
                <ModalBody>
                    <p>The created comparison can be shared using the following link: </p>

                    <InputGroup>
                        <Input
                            value={!this.state.shortLinkIsLoading ? this.state.link : 'Loading...'}
                            disabled
                        />
                        <InputGroupAddon addonType="append">
                            <CopyToClipboard id="copyToClipboardLink" text={!this.state.shortLinkIsLoading ? this.state.link : 'Loading...'} onCopy={() => { this.setState({ showTooltipCopiedLink: true }); }} >
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3"
                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                >
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip placement="top" target="copyToClipboardLink" trigger={'hover'} toggle={this.toggleTooltip} isOpen={this.state.showTooltipCopiedLink}>
                                Copied!
                            </ReactstrapTooltip>
                        </InputGroupAddon>
                    </InputGroup>

                    <CustomInput
                        className="mt-1"
                        type="checkbox"
                        id={'shortLink'}
                        label="Create a persistent short link for this page."
                        onChange={() => this.toggleShareShortLink()}
                        checked={this.state.shareShortLink}
                    />
                    {this.state.shortLinkIsFailed && (
                        <Alert color="light" className="mb-0 mt-1">Failed to create a short link, please try again later</Alert>
                    )}

                </ModalBody>
            </Modal >
        );
    }
}

Share.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect(
    mapStateToProps
)(Share);