import React from 'react';
import Style from 'style-it';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { Modal, ModalHeader, ModalBody, Table, Alert } from 'reactstrap';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { SortableContainer } from 'react-sortable-hoc';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import ReportLoader from 'components/Comparison/Maturity/ReportLoader';
import { useParams } from 'react-router-dom';

const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
`;

const ShowHideSpan = styled.span`
    color: red;
    &:hover,
    &:focus {
      text-decoration: underline;
    }
`;

const showHide = (event, id) => {
    let ontologiesID = document.getElementById(id);
    let clickSpan = document.getElementById('clickMe');
    if (ontologiesID.style.display == 'none') {
        ontologiesID.style.display = 'block';
        clickSpan.innerHTML = 'Click to hide';
    } else {
        ontologiesID.style.display = 'none';
        clickSpan.innerHTML = 'Click to see';
    }
}

const showReviewsReportSummary = (object, item, flag) => {
     let message = '';
     if(object !== null && typeof object === 'object' && Array.isArray(object) === true){
       if (object[item][flag]!== undefined) {
         message = object[item][flag];
         (flag == true) ? message+=' Agree' : message+=' Disagree';
       } else {
       message = 'No Reviews';
      }
     }
     else{
       message = 'No Reviews';
     }
     return message;
};

function MaturityReviewsReport(props) {
    let color, message = '';
    if(props.reviewsCount >= props.mostSelectedReviewNumber){
      color = 'info';
      message = 'This comparison has so far '+props.reviewsCount+' review(s) out of needed '+props.mostSelectedReviewNumber+' review(s)';
    }
    else{
      color = 'danger';
      message = 'This comparison has so far ( '+props.reviewsCount+' review(s) out of '+ props.mostSelectedReviewNumber+' review(s)) and still needs more '+(props.mostSelectedReviewNumber-props.reviewsCount)+' review(s) to move to maturity level '+(props.maturityLevel+1);
    }

    const showReviewersData = (object, item) => {
        if(object !== null && typeof object === 'object' && Array.isArray(object) === true){
          if (object[item]!== undefined) {
            if(item=='externalOntologiesItem'){
              const tableBody = Object.keys(object[item]).map((obj, i) => (
                <tr key={i}>
                  <td>
                    <Tippy content="Please click, and do not copy the URL">
                      <a href={Object.keys(object[item])[i]}>{Object.keys(object[item])[i].match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img)}</a>
                    </Tippy>
                  </td>
                  <td>{object[item][Object.keys(object[item])[i]]} time(s)</td>
                </tr>
              ));
              return (
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>recommended</th>
                    </tr>
                  </thead>
                  <tbody>{tableBody}</tbody>
                </table>
              );
            }
            else{
              const listBody = Object.keys(object[item]).map((obj, i) => (
                 <li>{Object.keys(object[item])[i]}</li>
              ));
              return (
                <ul>
                  {listBody}
                </ul>
              );
            }
          }
        }
    };

    const MaturityTable = SortableContainer(({ items }) => {
        return (
        <>
          { (typeof props.mostSelectedReviewNumber!==undefined && props.mostSelectedReviewNumber>=0 && typeof props.reviewsCount!==undefined && props.reviewsCount>=0) ? (
          <TableContainerStyled>
              <Alert color={color}>{message}</Alert>
              <Table bordered hover className="m-0">
                  <thead>
                      <tr>
                          <td key="1" style={{ width: '67%', fontWeight: 'bold' }}>
                              Question
                          </td>
                          <td key="2" style={{ width: '15%', fontWeight: 'bold' }}>
                              Agree <Icon icon={faThumbsUp} className="me-1" />
                          </td>
                          <td key="2" style={{ width: '18%', fontWeight: 'bold' }}>
                              Disagree <Icon icon={faThumbsDown} className="me-1" />
                          </td>
                      </tr>
                  </thead>
                  <tbody>
                      <tr key="1">
                          <td key="1">Do you think that the comparison has enough properties?</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'numberOfProperties', true)}</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'numberOfProperties', false)}</td>
                      </tr>
                      <tr key="1">
                          <td key="1">Do you think that the comparison needs links to external ontologies?</td>
                          <td key="2">
                              {showReviewsReportSummary(props.reviewsReportSummary, 'externalOntologies', true)}
                              <Style>
                                  {`
                                   .intro {
                                      color: red;
                                   }
                                  .intro:hover {
                                    text-decoration: underline;
                                  }
                                `}
                                </Style>
                                <ShowHideSpan>
                                  <span onClick={e => showHide(e, 'ontologies')}>

                                  </span>
                                </ShowHideSpan>
                                  <span id="ontologies" style={{ display: 'none' }}>
                                      {showReviewersData(props.reviewsReportSummary, 'externalOntologiesItem')}
                                  </span>
                          </td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'externalOntologies', false)}</td>
                      </tr>
                      <tr key="1">
                          <td key="1">Do you think that the comparison outdated? </td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'outDatedResults', true)}</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'outDatedResults', false)}</td>
                      </tr>
                      <tr key="1">
                          <td key="1">Do you think that the comparison has adequate resource/ property values? </td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'ratioOfLiteral', true)}</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'ratioOfLiteral', false)}</td>
                      </tr>
                      <tr key="1">
                          <td key="1">Do you think the comparison should have a visualization?</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'visualization', true)}</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'visualization', false)}</td>
                      </tr>
                      <tr key="1">
                          <td key="1">Do you think that the comparison could have more contributions? </td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'contributionsAmount', true)}</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'contributionsAmount', false)}</td>
                      </tr>
                      <tr key="1">
                          <td key="1">Do you think that the comparison's description is descriptive ?</td>
                          <td key="2">{showReviewsReportSummary(props.reviewsReportSummary, 'description', true)}</td>
                          <td key="2">
                                {showReviewsReportSummary(props.reviewsReportSummary, 'description', false)}
                                <ShowHideSpan>
                                  <span onClick={e => showHide(e, 'reviewersDescriptions')}>
                                      <br /> <span id="clickMe">Click to see</span>
                                  </span>
                                </ShowHideSpan>
                                <span id="reviewersDescriptions" style={{ display: 'none' }}>
                                    {showReviewersData(props.reviewsReportSummary, 'descriptionData')}
                                </span>
                          </td>
                      </tr>
                      <tr key="1">
                          <td key="1">Comments</td>
                          <td key="2" colspan="2">{showReviewersData(props.reviewsReportSummary, 'comments')}</td>
                      </tr>
                  </tbody>
              </Table>
          </TableContainerStyled>
         ) : (
           <ReportLoader />
        )}
      </>
        );
    });

    return (
        <Modal isOpen={props.showMaturityReviewsReportDialog} toggle={props.toggleMaturityReviewsReportDialog} size="lg">
            <ModalHeader toggle={props.toggleMaturityReviewsReportDialog}>Maturity Reviews Report</ModalHeader>
            <ModalBody>
                <MaturityTable />
            </ModalBody>
        </Modal>
    );
}

MaturityReviewsReport.propTypes = {
    showMaturityReviewsReportDialog: PropTypes.bool.isRequired,
    toggleMaturityReviewsReportDialog: PropTypes.func.isRequired,
    reviewsCount: PropTypes.number.isRequired,
    mostSelectedReviewNumber: PropTypes.number.isRequired,
    maturityLevel: PropTypes.number.isRequired,
    reviewsReportSummary: PropTypes.object.isRequired
};

export default MaturityReviewsReport;
