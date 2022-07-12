import { useState, useCallback, useEffect  } from 'react';
import { faLongArrowAltDown, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { SortableContainer } from 'react-sortable-hoc';
import { useTable, useSortBy } from 'react-table';
import Tooltip from 'components/Utils/Tooltip';
import styled from 'styled-components';
//import { Chart } from 'react-google-charts';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { openAuthDialog } from 'actions/auth';
import Publish from 'components/Comparison/Publish/Publish';
import MaturityReviewsReport from 'components/Comparison/Maturity/MaturityReviewsReport';
import ManageMaturityReviews from 'components/Comparison/Maturity/ManageMaturityReviews';
import ReportLoader from 'components/Comparison/Maturity/ReportLoader';
import { useParams } from 'react-router-dom';
import useComparison from 'components/Comparison/hooks/useComparison';
import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';
import { NavLink } from 'react-router-dom';
const TableContainerStyled = styled.div`
    //overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
    overflow-x: scroll
`;
 function MaturityReport(props) {
    const { id } = useParams(); //, isLoadingVersions, hasNextVersion, versions
    const [showMaturityReviewsReportDialog, setShowMaturityReviewsReportDialog] = useState(false);
    const maturityLevelMessage = (currentLevel,uniqueReviewsProperties,mostSelectedReviewNumber) => {
      //let levelMessage = '';
      switch (currentLevel) {
        case 1:
          return ('You reached this level once you have created the comparison');
        break;
        case 2:
          if(uniqueReviewsProperties !== null && typeof uniqueReviewsProperties === 'object' && Array.isArray(uniqueReviewsProperties) === false)
          {
            if(Object.keys(uniqueReviewsProperties).length>0) {
              const tableBody = Object.keys(uniqueReviewsProperties).map((key, index) => (
                <tr key={index}>
                  <td width='25%'>
                    <li>{uniqueReviewsProperties[Object.keys(uniqueReviewsProperties)[key]]}</li>
                  </td>
                </tr>
              ));
              return (
                <>
                  <span>The reviewers have recomended to add these properties to your comparison: (<span style={{ color: 'red' }}>some of the recommended properties might have been removed because it is already in the comparison itself</span>)</span>
                  <table>{tableBody}</table>
                </>
              );
            }
          }
          else{
            //levelMaessage = '<span>This level is reached when the minimum reviews number (<b>'+mostSelectedReviewNumber+' review(s) at least are needed</b>) is met. So far, no reviews were added</span>';
            return ('There are no recomended propeties');
          }
        break;
        case 3:
          return ('Publish the comparison');
        break;
        case 4:
          return ('Assign a DOI to the comparison');
        break;
        case 5:
          return ("Add at least one link to an external ontolgy");
        break;
      }
    };

    const MaturityTable = SortableContainer(() => {
        return (
            <>
              { (typeof props.mostSelectedReviewNumber!==undefined && props.mostSelectedReviewNumber>=0 && typeof props.reviewsCount!==undefined && props.reviewsCount>=0) ? (
                <>
                {props.maturityReportMessage}
                <br />
                <TableContainerStyled>
                    <Table bordered hover className="m-0">
                        <thead>
                            <tr>
                                <td style={{ width: '20%', fontWeight: 'bold' }}>
                                    Maturity Level
                                </td>
                                <td style={{ width: '80%', fontWeight: 'bold' }}>
                                    Explaination
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={(props.maturityLevel == 1) ? {backgroundColor: '#f7eaec'} : {}}>
                                <td key="1">
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td>{maturityLevelMessage(1,props.uniqueReviewsProperties,props.mostSelectedReviewNumber)}</td>
                            </tr>
                            <tr style={(props.maturityLevel == 2) ? {backgroundColor: '#f7eaec'} : {}}>
                                <td>
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td>
                                  {maturityLevelMessage(2,props.uniqueReviewsProperties,props.mostSelectedReviewNumber)}
                                </td>
                            </tr>
                            <tr style={(props.maturityLevel == 3) ? {backgroundColor: '#f7eaec'} : {}}>
                                <td key="1">
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td key="2">
                                    {maturityLevelMessage(3,props.uniqueReviewsProperties,props.mostSelectedReviewNumber)}
                                </td>
                            </tr>
                            <tr style={(props.maturityLevel == 4) ? {backgroundColor: '#f7eaec'} : {}}>
                                <td>
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" style={{ color: '#8080804a'}} />
                                </td>
                                <td key="2">{maturityLevelMessage(4,props.uniqueReviewsProperties,props.mostSelectedReviewNumber)}</td>
                            </tr>
                            <tr style={(props.maturityLevel == 5) ? {backgroundColor: '#f7eaec'} : {}}>
                                <td>
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                  <Icon icon={faStar} className="me-1" />
                                </td>
                                <td key="2">
                                  {maturityLevelMessage(5,props.uniqueReviewsProperties,props.mostSelectedReviewNumber)}
                                  Add at least one link to an external ontolgy (e.g,
                                  <a style={{ color: '#e86161' }} href="#" onClick={() => window.open('https://service.tib.eu/ts4tib/index')}>
                                      TIB Terminology Service
                                  </a>
                                  )
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </TableContainerStyled>
                </>
              ) : (
                <ReportLoader />
             )}
            </>
        );
    });

    return (
        <>
            <Modal isOpen={props.showMaturityReportDialog} toggle={props.toggleMaturityReportDialog} size="lg">
                <ModalHeader toggle={props.toggleMaturityReportDialog}>Maturity Report</ModalHeader>
                <ModalBody>
                    {/* <Chart
                        width="100%"
                        height="320px"
                        chartType="PieChart"
                        loader={<div>Loading Chart</div>}
                        data={pieData}
                        options={pieOptions}
                        rootProps={{ 'data-testid': '3' }}
                    /> */}
                    <MaturityTable />
                    {/* <MaturityTable /> */}
                </ModalBody>
            </Modal>
            <MaturityReviewsReport
                showMaturityReviewsReportDialog={showMaturityReviewsReportDialog}
                toggleMaturityReviewsReportDialog={() => setShowMaturityReviewsReportDialog(v => !v)}
            />
        </>
    );
}

MaturityReport.propTypes = {
    showMaturityReportDialog: PropTypes.bool.isRequired,
    toggleMaturityReportDialog: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    openAuthDialog: PropTypes.func.isRequired
};

export default MaturityReport;
