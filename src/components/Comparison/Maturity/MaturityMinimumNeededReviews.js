import Style from 'style-it';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { Modal, ModalHeader, ModalBody, Table, Alert, Button, Form } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { SortableContainer } from 'react-sortable-hoc';
import { useTable, useSortBy } from 'react-table';
import Tooltip from 'components/Utils/Tooltip';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import useComparison from 'components/Comparison/hooks/useComparison';
import { createLiteralStatement } from 'services/backend/statements';
import { createLiteral } from 'services/backend/literals';
import ManageMaturityReviews from 'components/Comparison/Maturity/ManageMaturityReviews';
const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
`;


const handleSubmit = async (event) => {
  event.preventDefault();
  const reviewsCount = event.target.reviewsCount.value;
  const otherReviewsCount = event.target.otherReviewsCount.value;
  console.log(otherReviewsCount, reviewsCount);
  if(reviewsCount<1 || reviewsCount=='other' && isNaN(otherReviewsCount)){
    toast.error('Please select the minimum reviews, or select other and add a number between 5 and 9');
  }
  else{
    try {
          const userVote = (reviewsCount>0) ? reviewsCount : otherReviewsCount;
          const vote = await createLiteral(userVote);
          const literalStatement = await createLiteralStatement('R134058', 'P39002', vote.id);
          console.log(literalStatement);
          toast.success('The review has been saved successfully');
        } catch (e) {
            console.log(e);
            toast.error('An error occurred while adding the minimum reviews value');
       }
  }
};

const showHideOtherDiv = (event) => {
    let selectedValue = event.target.value;
    console.log(selectedValue);
    const divID = document.getElementById('otherReviewsCountDiv');
    if(selectedValue == 'other') {
        divID.style.display = 'block';
    }
    else{
      divID.style.display = 'none';
      document.getElementById('otherReviewsCount').value = 'Please type a number more than 5 and less than 9';
    }
}

function MaturityMinimumNeededReviews(props) {
    const { id } = useParams(); //, isLoadingVersions, hasNextVersion, versions
    const {
        metaData,
        data
    } = useComparison({ id:id });
    const { votesCount } = ManageMaturityReviews({ data: data, metaData: metaData});
    const chartFirstElement = ['Reviews', ' The selected reviews']; // it is required by Google chart!
    const pieData = [chartFirstElement].concat(votesCount)
    const pieOptions = {
        title: 'Maturity Minimum Needed Reviews Report',
        pieHole: 0.4
    };
    const MaturityTable = SortableContainer(({ items }) => {
        return (
          <>
              <Alert color="info">
                  <b style={{ textDecoration: 'underline' }}>Please read</b>: <br />
                  - In your opinion, what are the minimum needed reviews to judge a comparison? For example, if you have decided to say 5 reviewers is the minimum number of reviews.
                   This means less than 5 reviews for one comparison would not be sufficient to make the comparison move to the next level of maturity.
                  <br />
                  - After you submit your choice, the system will automatically select the most selected value to be the minimum needed number of reviews
              </Alert>
              <br />
            <TableContainerStyled>
              <Form onSubmit={e => handleSubmit(e)}>
                <Table bordered hover className="m-0">
                    <thead>
                        <tr>
                            <td key="1">
                                What is the minimum reviews?
                            </td>
                            <td key="2">
                            <select class="form-control-sm" id='reviewsCount' onChange={e => showHideOtherDiv(e)}>
                              <option value="0">Please select</option>
                              <option value="2">Two reviews</option>
                              <option value="3">Three reviews</option>
                              <option value="4">Four reviews</option>
                              <option value="5">Five reviews</option>
                              <option value="other">Other</option>
                            </select>
                            <span id='otherReviewsCountDiv' style={{ display: 'none' }}>
                            <input
                                type="text"
                                id="otherReviewsCount"
                                className="form-control-sm"
                                defaultValue="Please type a number above 5 and less than 9"
                                onClick={e => (e.target.value = '')}
                                onBlur={e => ((isNaN(e.target.value) || e.target.value < 6 || e.target.value > 9) ? e.target.value='Please type a number above 5 and less than 9' : e.target.value)}
                            />
                            </span>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr key="1">
                            <td colspan="2">
                              <Button color="btn btn-primary"> Send </Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
              </Form>
            </TableContainerStyled>
          </>
        );
    });

    return (
        <Modal isOpen={props.showMaturityMinimumNeededReviewsDialog} toggle={props.toggleMaturityMinimumNeededReviewsDialog} size="lg">
            <ModalHeader toggle={props.toggleMaturityMinimumNeededReviewsDialog}>Maturity Minimum Needed Reviews</ModalHeader>
            <ModalBody>
                <Chart
                    width="100%"
                    height="320px"
                    chartType="PieChart"
                    loader={<div>Loading Chart</div>}
                    data={pieData}
                    options={pieOptions}
                    rootProps={{ 'data-testid': '3' }}
                />
                <MaturityTable />
            </ModalBody>
        </Modal>
    );
}

MaturityMinimumNeededReviews.propTypes = {
    showMaturityMinimumNeededReviewsDialog: PropTypes.bool.isRequired,
    toggleMaturityMinimumNeededReviewsDialog: PropTypes.func.isRequired
};

export default MaturityMinimumNeededReviews;
