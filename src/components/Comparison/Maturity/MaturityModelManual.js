import { useState, useCallback, useEffect  } from 'react';
import { faLongArrowAltDown, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { Modal, ModalHeader, ModalBody, Table, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { SortableContainer } from 'react-sortable-hoc';
import { useTable, useSortBy } from 'react-table';
import Tooltip from 'components/Utils/Tooltip';
import styled from 'styled-components';
import ReportLoader from 'components/Comparison/Maturity/ReportLoader';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { openAuthDialog } from 'actions/auth';
import MaturityMinimumNeededReviews from 'components/Comparison/Maturity/MaturityMinimumNeededReviews';
import { useParams } from 'react-router-dom';
import useComparison from 'components/Comparison/hooks/useComparison';
import { NavLink } from 'react-router-dom';
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
    //overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
    overflow-x: scroll
`;
 function MaturityModelManual(props) {
   console.log(props);
    const { id } = useParams();
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [showMaturityMinimumNeededReviewsDialog, setShowMaturityMinimumNeededReviewsDialog] = useState(false);
    const MaturityTable = SortableContainer(() => {
        return (
           <>
            { (typeof props.mostSelectedReviewNumber!==undefined && props.mostSelectedReviewNumber>=0) ? (
              <>
               <Alert color="success">
                  Here is a detailed explanation of how the maturity model works for the comparison
               </Alert>
                <br />
                <TableContainerStyled>
                    <Table bordered hover className="m-0">
                        <thead>
                            <tr>
                                <td key="1" style={{ width: '20%', fontWeight: 'bold' }}>
                                    Maturity Level
                                </td>
                                <td key="2" style={{ width: '80%', fontWeight: 'bold' }}>
                                    Explaination
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{backgroundColor: '#f7eaec'}}>
                                <td key="1">
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td key="2">The comparison reaches this level once it is created</td>
                            </tr>
                            <tr>
                                <td>
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td>
                                  This level requires some points to be covered before the maturity is passed:
                                  <ol>
                                    <li>
                                      Each comparison should be reviewed by a minimum number of reviewers. This number does not include the comparison's creator (the minimum needed number of reviewers now is: <b>{props.mostSelectedReviewNumber}</b>).
                                      You can add the minimum reviews, or/ and see the full report form &nbsp;
                                      <a style={{ color: 'red'}} onClick={() => setShowMaturityMinimumNeededReviewsDialog(v => !v)}>
                                          here
                                      </a>
                                    </li>
                                    <li>
                                        Once the minimum needed reviews have reached. The comparisons creator should act according to the reviewer's feedback, so the user should do the following:
                                        <ul>
                                          <li>
                                           The comparison's creator should add the suggested properties by the reviewers to the comparison <br/>(<u style={{ color: 'red'}}>Note</u>: The duplicated suggested properties are removed from the properties list)
                                          </li>
                                          <li>
                                           The comparison's creator should add a description to the comparison, if it does not have and if 50% or more of the reviewers think that it should has. <br/>(<u style={{ color: 'red'}}>Note</u>: The description could be the same as or different from what the reviewers have suggested)
                                          </li>
                                        </ul>
                                    </li>
                                  </ol>
                                </td>
                            </tr>
                            <tr key="1">
                                <td key="1">
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td key="2">
                                    This level requires the below points to be fulfiled:
                                    <ol>
                                      <li>If 50% or more of the reviewers said that the comparison should have a visualization. Then the comparison's owner should add at least one visualization to it</li>
                                      <li>The comparison should be published</li>
                                  </ol>
                                </td>
                            </tr>
                            <tr key="1">
                                <td key="1">
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td key="2">Assign a DOI to the comparison from here</td>
                            </tr>
                            <tr key="1">
                                <td key="1">
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                </td>
                                <td key="2">
                                  If 50% or more of the reviewers said a link to an external ontolgy (e.g,
                                  <a style={{ color: '#e86161' }} href="#" onClick={() => window.open('https://service.tib.eu/ts4tib/index')}>
                                      TIB Terminology Service)
                                  </a> should be added to a comparison. Then the comparison's owner should add at least one link to an external ontolgy
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </TableContainerStyled>
                <MaturityMinimumNeededReviews
                    metaData = {props.metaData}
                    showMaturityMinimumNeededReviewsDialog={showMaturityMinimumNeededReviewsDialog}
                    toggleMaturityMinimumNeededReviewsDialog={() => setShowMaturityMinimumNeededReviewsDialog(v => !v)}
                    toggleMaturityMinimumNeededReviews={props.toggleProperty}
                />
                </>
              ) : (
                <ReportLoader />
             )}
            </>
        );
    });
    return (
        <>
            <Modal isOpen={props.showMaturityModelManualDialog} toggle={props.toggleMaturityModelManualDialog} size="lg">
                <ModalHeader toggle={props.toggleMaturityModelManualDialog}>Maturity Model Manual</ModalHeader>
                <ModalBody>
                    <MaturityTable />
                </ModalBody>
            </Modal>
        </>
    );
}

MaturityModelManual.propTypes = {
    showMaturityModelManualDialog: PropTypes.bool.isRequired,
    toggleMaturityModelManualDialog: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    openAuthDialog: PropTypes.func.isRequired
};

export default MaturityModelManual;
