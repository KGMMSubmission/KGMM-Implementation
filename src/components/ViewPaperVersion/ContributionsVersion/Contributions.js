import { Alert, Col, Container, FormGroup, Row } from 'reactstrap';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import { useSelector } from 'react-redux';
import { StyledContributionTabs } from 'components/ContributionTabs/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import useContributions from './hooks/useContributions';
import Tabs, { TabPane } from 'rc-tabs';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from 'constants/graphSettings';
import { ListGroup } from 'reactstrap';
const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const Contributions = props => {
    const { resourceId, contributionId } = useParams();

    const {
        isLoading,
        isLoadingContributionFailed,
        isSimilarContributionsLoading,
        isSimilarContributionsFailedLoading,
        similarContributions,
        selectedContribution,
        contributions,
        paperTitle,
        contributionData
    } = useContributions({
        paperId: resourceId,
        contributionId
    });
    const isAddingContribution = useSelector(state => state.viewPaper.isAddingContribution);

    const onTabChange = key => {};

    return (
        <div>
            <Container>
                <Row>
                    <Col md="9">
                        {isLoading && (
                            <div>
                                <ContentLoader
                                    height="100%"
                                    width="100%"
                                    viewBox="0 0 100 6"
                                    style={{ width: '100% !important' }}
                                    speed={2}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="1" ry="1" width={20} height="5" />
                                    <rect x="21" y="0" rx="1" ry="1" width={20} height="5" />
                                    <rect x="42" y="0" rx="1" ry="1" width={20} height="5" />
                                </ContentLoader>
                            </div>
                        )}
                        <StyledContributionTabs>
                            <Tabs
                                moreIcon={<Icon size="lg" icon={faAngleDown} />}
                                activeKey={selectedContribution}
                                destroyInactiveTabPane={true}
                                onChange={onTabChange}
                            >
                                {props.contributions.map(contribution => (
                                    <TabPane
                                        tab={
                                            <ContributionTab
                                                handleChangeContributionLabel={() => {}}
                                                isSelected={contribution.id === selectedContribution}
                                                canDelete={false}
                                                contribution={contribution}
                                                key={contribution.id}
                                                toggleDeleteContribution={() => {}}
                                                enableEdit={false}
                                            />
                                        }
                                        key={contribution.id}
                                    >
                                        {!isLoadingContributionFailed && (
                                            <div>
                                                <FormGroup>
                                                    {isLoading && (
                                                        <div>
                                                            <ContentLoader
                                                                height="100%"
                                                                width="100%"
                                                                viewBox="0 0 100 6"
                                                                style={{ width: '100% !important' }}
                                                                speed={2}
                                                                backgroundColor="#f3f3f3"
                                                                foregroundColor="#ecebeb"
                                                            >
                                                                <rect x="0" y="0" rx="1" ry="1" width="90" height="6" />
                                                            </ContentLoader>
                                                        </div>
                                                    )}
                                                    {console.log(contributionData)}
                                                    {!isLoading && contributionData && (
                                                        <>
                                                            {contributionData.map(cd => (
                                                                <StatementsGroupStyle className="noTemplate list-group-item">
                                                                    <div className="row gx-0">
                                                                        <PropertyStyle className="col-4" tabIndex="0">
                                                                            {true && (
                                                                                <div>
                                                                                    <div className="propertyLabel">
                                                                                        <DescriptionTooltip id="p26" typeId={ENTITIES.PREDICATE}>
                                                                                            {cd.predicate.label}
                                                                                        </DescriptionTooltip>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </PropertyStyle>
                                                                        <ValuesStyle className="col-8 valuesList">
                                                                            <ListGroup flush className="px-3">
                                                                                {cd.object.label}
                                                                            </ListGroup>
                                                                        </ValuesStyle>
                                                                    </div>
                                                                </StatementsGroupStyle>
                                                            ))}
                                                        </>
                                                    )}
                                                </FormGroup>
                                            </div>
                                        )}
                                        {isLoadingContributionFailed && (
                                            <>
                                                <Alert className="mt-4 mb-5" color="danger">
                                                    {contributions.length === 0 && 'This paper has no contributions yet!'}
                                                    {contributions.length !== 0 && "Contribution doesn't exist."}
                                                </Alert>
                                            </>
                                        )}
                                    </TabPane>
                                ))}
                            </Tabs>
                        </StyledContributionTabs>
                    </Col>

                    <div className="col-md-3">
                        <ProvenanceBox />
                    </div>
                </Row>
            </Container>
        </div>
    );
};

Contributions.propTypes = {
    toggleEditMode: PropTypes.func.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    contributions: PropTypes.object
};

export default Contributions;
