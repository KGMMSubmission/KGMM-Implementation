import { faEnvelope, faInfo, faTrash, faComments, faChartBar, faLessThanEqual, faQuestionCircle  } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Input, Label, InputGroup, Table, Alert } from 'reactstrap';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { useState, Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { SortableContainer } from 'react-sortable-hoc';
import { useTable, useSortBy } from 'react-table';
//import Tooltip from 'components/Utils/Tooltip';
import styled from 'styled-components';
//import pluralize from 'pluralize';
//import UserAvatar from 'components/UserAvatar/UserAvatar';
import { useParams } from 'react-router-dom';
import FormCheck from 'react-bootstrap/FormCheck';
import ComparisonMetaData from 'components/Comparison/ComparisonMetaData';
import useComparison from 'components/Comparison/hooks/useComparison';
import Tippy from '@tippyjs/react';
import ShowComparison from 'components/Comparison/Maturity/ShowComparison';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import Confirm from 'components/Confirmation/Confirmation';
import MaturityReport from 'components/Comparison/Maturity/MaturityReport';
import MaturityReviewsReport from 'components/Comparison/Maturity/MaturityReviewsReport';
import MaturityMinimumNeededReviews from 'components/Comparison/Maturity/MaturityMinimumNeededReviews';
import ManageMaturityReviews from 'components/Comparison/Maturity/ManageMaturityReviews';
import MaturityModelManual  from 'components/Comparison/Maturity/MaturityModelManual';
import SendEMail from 'components/Comparison/Maturity/SendEMail';
import { createResourceData } from 'services/similarity/index';
import { createResource } from 'services/backend/resources';
import { createResourceStatement } from 'services/backend/statements';
import { toast } from 'react-toastify';

const TableContainerStyled = styled.div`
    //overflow: auto;
    font-size: 90%;
    background: ${props => props.theme.lightLighter};
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
    margin: 30px 60px 30px 60px;
    &::before, :after {
      box-sizing: border-box;
    }
    @media (max-width: 650px) {
      overflow-x: scroll
    }
`;

 async function handleSubmit(event, comparisonId) {
    event.preventDefault();
    let target = event.target;
    let data = {};
    for (let i = 0; i < target.length; i++) {
        if(event.target[i].id != '' && !event.target[i].id.startsWith('react')){
            data[event.target[i].id] =  event.target[i].value;
        }
    }
    try {
          //console.log(data);
          const id =  await createResource('review')
          createResourceData({
              resourceId: id.id,
              data: data
          });
          toast.success('The review has been saved successfully');
          await createResourceStatement(comparisonId, 'P39001', id.id); // when go online, you need to create a predicate and add the value instead of P39001
          //console.log(statment);
          // getStatementsBySubjectAndPredicate = ({ R133012, 'P39001', page = 0, items: size = 9999, sortBy = 'created_at', desc = true })
          //console.log(id.id);
        } catch (e) {
            toast.error('An error occurred while adding the review');
       }
}

const MaturityReview = () => {
    const [showMaturityModelManualDialog, setMaturityModelManualDialog] = useState(false);
    const [showMaturityMinimumNeededReviewsDialog, setShowMaturityMinimumNeededReviewsDialog] = useState(false);
    const [showMaturityReportDialog, setShowMaturityReportDialog] = useState(false);
    const [showMaturityReviewsReportDialog, setShowMaturityReviewsReportDialog] = useState(false);
    const [ShowComparisonDialog, setShowComparisonDialog] = useState(false);
    const [newPropertiesList, setNewPropertiesList] = useState({});
    const propertiesCount = Object.keys(newPropertiesList).length;
    const [numberOfPropertiesStatus, setNumberOfPropertiesStatus] = useState(false);
    const [externalOntologiesStatus, setExternalOntologiesStatus] = useState(false);
    const [externalOntologiesItemValue, setExternalOntologiesItemValue] = useState('e.g, https://service.tib.eu/ts4tib/index');
    const [ratioOfLiteralStatus, setRatioOfLiteralStatus] = useState(false);
    const [outDatedResultsStatus, setOutDatedResultsStatus] = useState(false);
    const [visualizationStatus, setVisualizationStatus] = useState(false);
    const [contributionsAmountStatus, setContributionsAmountStatus] = useState(false);
    const [descriptionStatus, setDescriptionStatus] = useState(false);
    const [commentsValue, setCommentsValue] = useState("Do you have any comments, or thoughts?");

    const handleDelete = async key => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: (
                <span>
                    The property <strong>{newPropertiesList[key].label}</strong> will be deleted. Are you sure?
                </span>
            )
        });
        if (result) {
            //const myObj = Object.values(newPropertiesList).filter(item => item.id !== key);
            //setNewPropertiesList(myObj);
            // filter is not working becasue it returns the object index of 0,1..etc while the expected is string p1,p2..etc
            let myObj = {};
            for (let innerKey in newPropertiesList) {
                myObj[innerKey] = {...newPropertiesList[innerKey]};
                if (key === newPropertiesList[innerKey].id) {
                    delete myObj[innerKey];
                }
            }
            setNewPropertiesList(myObj);
        }
    };

    const onNumberOfPropertiesAction = () => {
        setNumberOfPropertiesStatus(!numberOfPropertiesStatus);
        setNewPropertiesList({}); // clear it when the user change his/her mind
    };
    const onExternalOntologiesAction = () => {
        setExternalOntologiesStatus(!externalOntologiesStatus);
    };

    const onExternalOntologiesClick = () => {
      setExternalOntologiesItemValue("");
    };
    const onCommentsChange = (e) => {
        setCommentsValue(e.target.value);
    };
    const onCommentsClick = () => {
      setCommentsValue("");
    };
    const onRatioOfLiteralAction = () => {
        setRatioOfLiteralStatus(!ratioOfLiteralStatus);
    };
    const onOutDatedResultsAction = () => {
        setOutDatedResultsStatus(!outDatedResultsStatus);
    };
    const onVisualizationAction = () => {
        setVisualizationStatus(!visualizationStatus);
    };
    const onContributionsAmounAction = () => {
        setContributionsAmountStatus(!contributionsAmountStatus);
    };
    const onDescriptionAction = () => {
        setDescriptionStatus(!descriptionStatus);
    };
    const { id } = useParams();
    const {
        data,
        Comparison,
        filterControlData,
        comparisonType,
        metaData,
        //matrixData,
        properties,
        contributions,
        toggleProperty,
        publicURL,
        updateRulesOfProperty,
        createdBy,
        responseHash
    } = useComparison({ id });
    const isPublished = metaData?.id || responseHash ? true : false;
    console.log(metaData);
    const { reviewsData, uniqueReviewsProperties, maturityReportMessage, maturityLevel, reviewsCount, mostSelectedReviewNumber, reviewsReportSummary } = ManageMaturityReviews({ data: data, metaData: metaData , isPublished: isPublished, url:publicURL });
    const listProperties = properties.map(label => <li>{label.label}</li>);
    const listContributions = contributions.map(title => <li>{title.title}</li>);
    //const listResources = matrixData.map(data => <li>{data + ' , '}</li>);
    const comparisonURL = reverse(ROUTES.COMPARISON, { comparisonId: metaData?.id || metaData?.hasPreviousVersion?.id });
    const { mailObject } = SendEMail({ url:publicURL , title:metaData.title  });
    document.title = `Maturity review for the comparison:  ${metaData.title} - ORKG`;
    let comparisonCreator = '';
    if(createdBy !== null && typeof createdBy !== 'object' && Array.isArray(createdBy) === false){
     comparisonCreator = createdBy[Object.keys(createdBy)[0]];
    }
    const userId = useSelector(state => state.auth.user.id);
    const MaturityTable = () => {
        return (
            <>
                <Form onSubmit={e => handleSubmit(e, id)}>
                    <TableContainerStyled>
                        <ShareLinkMarker typeOfLink="Maturity Review" title={metaData?.title} rightEdgeValue="10" />
                        <div style={{ padding: '10px' }}>
                            <div className="flex-grow-1">
                                <h2 className="h4 mb-4 mt-4">
                                    Maturity review for the comparison:
                                    <a href={comparisonURL} target="_blank">
                                        {metaData.title}
                                    </a>
                                </h2>
                                <ComparisonMetaData metaData={metaData} />
                                <span style={{ float: 'right' }}>
                                    <Tippy content="Maturity Model Manual">
                                        <span onClick={() => setMaturityModelManualDialog(v => !v)}>
                                            <Icon icon={faQuestionCircle} className="me-2" />
                                        </span>
                                    </Tippy>
                                    <Tippy content="Click to tell us the minimum needed reviews to validate a comparison">
                                        <span onClick={() => setShowMaturityMinimumNeededReviewsDialog(v => !v)}>
                                            <Icon icon={faLessThanEqual} className="me-2" />
                                        </span>
                                    </Tippy>
                                    <Tippy content={
                                        <>
                                            Comparison maturity level {maturityLevel}/5. Click to see the full report
                                        </>
                                    }>
                                        <span onClick={() => setShowMaturityReportDialog(v => !v)}>
                                            <Icon icon={faChartBar} className="me-2" />
                                        </span>
                                    </Tippy>
                                    <Tippy content={
                                        <>
                                            {reviewsCount} Review(s) out of {mostSelectedReviewNumber} reviews. Click to see the full report
                                        </>
                                    }>
                                        <span onClick={() => setShowMaturityReviewsReportDialog(v => !v)}>
                                            <Icon icon={faComments} className="me-2" />
                                        </span>
                                    </Tippy>
                                    {mailObject}
                                </span>
                            </div>
                        </div>
                        {comparisonCreator != userId ? (
                        <Table bordered hover className="m-0">
                            <thead>
                                <tr>
                                    <td style={{ width: '65%', fontWeight: 'bold' }}>Question</td>
                                    <td style={{ width: '35%', fontWeight: 'bold' }}>Do you agree with that?..</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        Do you think that the comparison has enough properties? &nbsp;
                                        <Tippy
                                            content={
                                                <>
                                                    <b>
                                                        List of properties: <br />
                                                    </b>
                                                    <ul>{listProperties}</ul>
                                                </>
                                            }
                                        >
                                            <span>
                                                <Icon icon={faInfo} />
                                            </span>
                                        </Tippy>
                                    </td>
                                    <td>
                                        <FormCheck
                                            key="numberOfProperties"
                                            type="switch"
                                            id="numberOfProperties"
                                            name="numberOfProperties"
                                            onChange={onNumberOfPropertiesAction}
                                            label={numberOfPropertiesStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={numberOfPropertiesStatus}
                                            style={{ color: numberOfPropertiesStatus == false ? 'black' : 'green' }}
                                            value={numberOfPropertiesStatus == false ? 'false' : 'true'}
                                        />
                                        <span id="propertiesSpan" style={{ display: numberOfPropertiesStatus == false ? 'block' : 'none' }} >
                                        <AutoComplete
                                            entityType={ENTITIES.PREDICATE}
                                            placeholder="Select or type to add a property"
                                            onChange={(selected, action) => {
                                                setNewPropertiesList(current => ({...current, [selected.id]: selected}))
                                            }}
                                            //isClearable
                                            autoLoadOption={true}
                                            //allowCreate={true}
                                            autoFocus={false}
                                        />
                                            {propertiesCount > 0 && (
                                                <>
                                                    <br />
                                                </>
                                            )}
                                            {Object.keys(newPropertiesList).map(function(key) {
                                                return (
                                                    <>
                                                        <span id={'propertySpan_' + key} />
                                                        <input
                                                            key={key}
                                                            id={'newProperty_' + key}
                                                            value={newPropertiesList[key].label}
                                                            className="form-control-sm"
                                                            type="text"
                                                            readonly
                                                        />
                                                        &nbsp;&nbsp;
                                                        <Icon icon={faTrash} onClick={() => handleDelete(key)} />
                                                        <br />
                                                    </>
                                                );
                                            })}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Do you think that the comparison needs links to external ontologies?</td>
                                    <td>
                                        <FormCheck
                                            key="externalOntologies"
                                            name="externalOntologies"
                                            type="switch"
                                            id="externalOntologies"
                                            onChange={onExternalOntologiesAction}
                                            label={externalOntologiesStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={externalOntologiesStatus}
                                            style={{ color: externalOntologiesStatus == false ? 'black' : 'green' }}
                                            value={externalOntologiesStatus == false ? 'false' : 'true'}
                                        />
                                        <span style={{ display: externalOntologiesStatus == false ? 'none' : 'block' }}>
                                            <input
                                                //onClick={onExternalOntologiesClick}
                                                id="externalOntologiesItem"
                                                name="externalOntologiesItem"
                                                className="form-control"
                                                type="text"
                                                value={externalOntologiesItemValue}
                                                onChange={(e) => setExternalOntologiesItemValue(e.target.value)}
                                            />
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Do you think that the comparison outdated?
                                    </td>
                                    <td>
                                        <FormCheck
                                            key="outDatedResults"
                                            type="switch"
                                            id="outDatedResults"
                                            onChange={onOutDatedResultsAction}
                                            label={outDatedResultsStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={outDatedResultsStatus}
                                            style={{ color: outDatedResultsStatus == false ? 'black' : 'green' }}
                                            value={outDatedResultsStatus == false ? 'false' : 'true'}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Do you think that the comparison has adequate resource/ property values? &nbsp;
                                        <Tippy
                                            content="Click to see the resource/ property values">
                                            <span>
                                                <Icon icon={faInfo} onClick={() => setShowComparisonDialog(v => !v)} />
                                            </span>
                                        </Tippy>
                                    </td>
                                    <td>
                                        <FormCheck
                                            type="switch"
                                            key="ratioOfLiteral"
                                            name="ratioOfLiteral"
                                            id="ratioOfLiteral"
                                            onChange={onRatioOfLiteralAction}
                                            label={ratioOfLiteralStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={ratioOfLiteralStatus}
                                            style={{ color: ratioOfLiteralStatus == false ? 'black' : 'green' }}
                                            value={ratioOfLiteralStatus == false ? 'false' : 'true'}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Do you think the comparison should have a visualization?</td>
                                    <td>
                                        <FormCheck
                                            type="switch"
                                            key="visualization"
                                            name="visualization"
                                            id="visualization"
                                            onChange={onVisualizationAction}
                                            label={visualizationStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={visualizationStatus}
                                            style={{ color: visualizationStatus == false ? 'black' : 'green' }}
                                            value={visualizationStatus == false ? 'false' : 'true'}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Do you think that the comparison could have more contributions? &nbsp;
                                        <Tippy
                                            content={
                                                <>
                                                    <b>
                                                        List of contributions: <br />
                                                    </b>
                                                    <ul>{listContributions}</ul>
                                                </>
                                            }
                                        >
                                            <span>
                                                <Icon icon={faInfo} />
                                            </span>
                                        </Tippy>
                                    </td>
                                    <td>
                                        <FormCheck
                                            key="switch"
                                            name="switch"
                                            type="switch"
                                            id="contributionsAmount"
                                            onChange={onContributionsAmounAction}
                                            label={contributionsAmountStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={contributionsAmountStatus}
                                            style={{ color: contributionsAmountStatus == false ? 'black' : 'green' }}
                                            value={contributionsAmountStatus == false ? 'false' : 'true'}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Do you think that the comparison's description is descriptive ? &nbsp;
                                        <Tippy
                                            content={
                                                <>
                                                    <b>
                                                        Description: <br />
                                                    </b>
                                                    <ul>{metaData.description}</ul>
                                                </>
                                            }
                                        >
                                            <span>
                                                <Icon icon={faInfo} />
                                            </span>
                                        </Tippy>
                                    </td>
                                    <td>
                                        <FormCheck
                                            type="switch"
                                            key="description"
                                            name="description"
                                            id="description"
                                            onChange={onDescriptionAction}
                                            label={descriptionStatus == false ? 'I do not agree with that' : 'I agree with that'}
                                            checked={descriptionStatus}
                                            style={{ color: descriptionStatus == false ? 'black' : 'green' }}
                                            value={descriptionStatus == false ? 'false' : 'true'}
                                        />
                                        <span id="descriptionSpan" style={{ display: descriptionStatus == false ? 'none' : 'block' }}>
                                            <textarea id="descriptionData" key="descriptionData" name="descriptionData" class="form-control" defaultValue={metaData.description} />
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>Comments</td>
                                    <td>
                                        <textarea
                                            key="comments"
                                            id="comments"
                                            name="comments"
                                            class="form-control"
                                            onClick={onCommentsClick}
                                            onChange={onCommentsChange}
                                            defaultValue={commentsValue}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <Button color="btn btn-primary"> Send </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        ) : (
                          <Table bordered hover className="m-0">
                              <tbody>
                                  <tr>
                                      <td>
                                       <Alert color="primary">
                                          You cannot add reviews to your own comparison. But you can ask someone to review it
                                          {mailObject}
                                      </Alert>
                                      </td>
                                  </tr>
                                </tbody>
                          </Table>
                        )}
                    </TableContainerStyled>
                </Form>
                <ShowComparison
                    ShowComparisonDialog={ShowComparisonDialog}
                    toggleShowComparisonDialog={() => setShowComparisonDialog(v => !v)}
                    toggleShowComparison={toggleProperty}
                    data={data}
                    properties={properties}
                    contributions={contributions}
                    comparisonType={comparisonType}
                    filterControlData={filterControlData}
                    updateRulesOfProperty={updateRulesOfProperty}
                    title={metaData.title}
                />
                <MaturityModelManual
                    showMaturityModelManualDialog={showMaturityModelManualDialog}
                    toggleMaturityModelManualDialog={() => setMaturityModelManualDialog(v => !v)}
                    mostSelectedReviewNumber = {mostSelectedReviewNumber}
                    metaData = {metaData}
                    toggleProperty = {toggleProperty}
                />
                <MaturityReviewsReport
                    showMaturityReviewsReportDialog={showMaturityReviewsReportDialog}
                    toggleMaturityReviewsReportDialog={() => setShowMaturityReviewsReportDialog(v => !v)}
                    reviewsCount = {reviewsCount}
                    mostSelectedReviewNumber = {mostSelectedReviewNumber}
                    reviewsReportSummary = {reviewsReportSummary}
                    maturityLevel={maturityLevel}
                />
                <MaturityMinimumNeededReviews
                    metaData = {metaData}
                    properties={properties}
                    showMaturityMinimumNeededReviewsDialog={showMaturityMinimumNeededReviewsDialog}
                    toggleMaturityMinimumNeededReviewsDialog={() => setShowMaturityMinimumNeededReviewsDialog(v => !v)}
                    toggleMaturityMinimumNeededReviews={toggleProperty}
                />
                <MaturityReport
                    showMaturityReportDialog={showMaturityReportDialog}
                    toggleMaturityReportDialog={() => setShowMaturityReportDialog(v => !v)}
                    toggleMaturityReport={toggleProperty}
                    reviewsCount = {reviewsCount}
                    mostSelectedReviewNumber = {mostSelectedReviewNumber}
                    reviewsData = {reviewsData}
                    uniqueReviewsProperties = {uniqueReviewsProperties}
                    maturityReportMessage = {maturityReportMessage}
                    maturityLevel={maturityLevel}
                />
            </>
        );
    };
    return <MaturityTable />;
}

MaturityReview.propTypes = {
    metaData: PropTypes.string.isRequired
};

export default MaturityReview;
