import React, { useEffect, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Card, CardFooter } from 'reactstrap';
import { getParentResearchFields, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faAngleDoubleDown, faSpinner, faHome } from '@fortawesome/free-solid-svg-icons';
import { PREDICATES } from 'constants/graphSettings';
import ContentLoader from 'react-content-loader';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

function Breadcrumbs(props) {
    const [parentResearchFields, setParentResearchFields] = useState([]);
    const [isOpen, setIsOpen] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSiblings, setIsLoadingSiblings] = useState(false);
    const [siblings, setSiblings] = useState([]);

    useEffect(() => {
        if (props.researchFieldID !== undefined) {
            setIsLoading(true);
            getParentResearchFields(props.researchFieldID).then(result => {
                setParentResearchFields(result.reverse());
                setIsLoading(false);
                setIsOpen(result.map(s => false));
                setSiblings(result.map(s => []));
                setIsLoadingSiblings(result.map(s => false));
            });
        }
    }, [props.researchFieldID]);

    const handleClickArrow = index => {
        setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? true : el)));
        setIsOpen(isOpen.map((el, i) => (i === index ? !el : false)));
        if (siblings[index] && !siblings[index].length) {
            // get siblings of parent
            getStatementsBySubjectAndPredicate({
                subjectId: parentResearchFields[index].id,
                predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD
            }).then(subRF => {
                setSiblings(siblings.map((el, i) => (i === index ? subRF.map(s => s.object) : el)));
                setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? false : el)));
            });
        } else {
            setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? false : el)));
        }
    };

    return (
        <Container className="p-0">
            <Card>
                <CardFooter style={{ borderTop: 0, borderRadius: '6px' }}>
                    {props.researchFieldID &&
                        !isLoading &&
                        parentResearchFields.map((field, index) => (
                            <span key={field.id}>
                                {index !== parentResearchFields.length - 1 ? (
                                    <Link to={index === 0 ? reverse(ROUTES.HOME) : reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: field.id })}>
                                        {index === 0 ? (
                                            <>
                                                <Icon className="mr-1" icon={faHome} />
                                                Home
                                            </>
                                        ) : (
                                            field.label
                                        )}
                                    </Link>
                                ) : (
                                    field.label
                                )}
                                {index !== parentResearchFields.length - 1 && (
                                    <Dropdown tag="span" isOpen={isOpen[index]} toggle={() => handleClickArrow(index)}>
                                        <DropdownToggle
                                            style={{ cursor: 'pointer', width: '15px', display: 'inline-block' }}
                                            tag="span"
                                            className="flex-1 ml-2 mr-2"
                                        >
                                            <Icon
                                                className={isOpen[index] ? 'mr-1' : ''}
                                                icon={isOpen[index] ? faAngleDoubleDown : faAngleDoubleRight}
                                            />
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {!isLoadingSiblings[index] ? (
                                                <>
                                                    {siblings[index] &&
                                                        siblings[index].length &&
                                                        siblings[index].map(rf => (
                                                            <DropdownItem key={`rf-${rf.id}`}>
                                                                <ConditionalWrapper
                                                                    condition={rf.id !== parentResearchFields[index + 1].id}
                                                                    wrapper={children => (
                                                                        <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: rf.id })}>
                                                                            {children}
                                                                        </Link>
                                                                    )}
                                                                >
                                                                    {rf.label}
                                                                </ConditionalWrapper>
                                                            </DropdownItem>
                                                        ))}
                                                </>
                                            ) : (
                                                <>
                                                    <Icon className="ml-3" icon={faSpinner} spin />
                                                </>
                                            )}
                                        </DropdownMenu>
                                    </Dropdown>
                                )}
                            </span>
                        ))}
                    {(!props.researchFieldID || isLoading) && (
                        <ContentLoader height={1} width={50} speed={2} primaryColor="#F7F7F7" secondaryColor="#ecebeb">
                            <rect x="0" y="0" rx="0" ry="0" width="50" height="100" />
                        </ContentLoader>
                    )}
                </CardFooter>
            </Card>
        </Container>
    );
}

Breadcrumbs.propTypes = {
    researchFieldID: PropTypes.string
};

export default Breadcrumbs;
