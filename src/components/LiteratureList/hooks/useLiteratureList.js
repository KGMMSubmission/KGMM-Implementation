import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import { countBy, orderBy } from 'lodash';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createLiteral } from 'services/backend/literals';
import { createResource, getResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    getStatementsBundleBySubject,
    getStatementsByObjectAndPredicate,
    getStatementsBySubject,
    getStatementsBySubjects
} from 'services/backend/statements';
import { createResourceData, getResourceData } from 'services/similarity';
import { listLoaded, versionsSet } from 'slices/literatureListSlice';

const useLiteratureList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const dispatch = useDispatch();

    const getListById = useCallback(async id => {
        // can be the ID of either a "published list" or a "head list"
        let listResource = await getResource(id).catch(e => {});
        let isPublished = false;
        if (!listResource) {
            notFound();
            return;
        }

        let statements = [];
        const paramId = id;

        // for published lists
        if (listResource.classes.includes(CLASSES.LITERATURE_LIST_PUBLISHED)) {
            const resourceData = await getResourceData(id).catch(e => {});
            if (!resourceData) {
                console.log('no resource data found');
                notFound();
                return;
            }
            const { data } = resourceData;
            statements = data.statements;
            id = data.rootResource;
            listResource = statements.find(statement => statement.subject.id === id).subject;
            isPublished = true;
        } else if (listResource.classes.includes(CLASSES.LITERATURE_LIST)) {
            ({ statements } = await getStatementsBundleBySubject({
                id,
                blacklist: [CLASSES.RESEARCH_FIELD],
                maxLevel: 5
            }));
        } else {
            console.log('no literature list classes found');
            notFound();
            return;
        }

        // get all versions for this list
        const versions = await getVersions(listResource.id);

        // get the research field
        let researchField = null;
        const researchFieldStatement = statements.find(
            statement => statement.subject.id === id && statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD
        );
        if (researchFieldStatement) {
            researchField = {
                id: researchFieldStatement.object.id,
                label: researchFieldStatement.object.label,
                statementId: researchFieldStatement.id
            };
        }

        const authorResources = getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_AUTHOR, id);
        const sectionResources = getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_SECTION, id);

        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(statements, section.id);
            sectionResources[index].statements = sectionStatements;
        }

        // add the orcid and statement id to the author statements
        for (const [index, author] of authorResources.entries()) {
            // orcid
            const orcidStatements = getStatementsBySubjectId(statements, author.id);
            if (orcidStatements.length) {
                const orcidStatement = orcidStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
                const orcid = orcidStatement ? orcidStatement.object.label : '';
                authorResources[index].orcid = orcid;
            }

            // statementId
            const statementId = getStatementsByObjectId(statements, author.id)[0]?.id;
            authorResources[index].statementId = statementId;
        }

        const sections = [];
        const papers = {};
        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(statements, section.id);
            sectionResources[index].statements = sectionStatements;
            const type = section.classes.length > 1 ? section.classes.find(_class => _class !== CLASSES.SECTION) : section.classes[0];

            const sectionData = {
                id: section.id,
                title: section.label,
                type
            };

            if ([CLASSES.LIST_SECTION].includes(type)) {
                sectionData.entries = section.statements
                    .filter(statement => statement.predicate.id === PREDICATES.HAS_ENTRY)
                    .map(statement => {
                        const entry = statement.object;
                        const entryId = entry.id;
                        const entryStatements = getStatementsBySubjectId(statements, entryId);
                        const paper = entryStatements.find(statement => statement.predicate.id === PREDICATES.HAS_PAPER)?.object;
                        const description = entryStatements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION)?.object;
                        const paperId = paper?.id;
                        const data = getPaperDataFromStatements({ paperResource: paper, statements });
                        papers[paperId] = data;

                        return {
                            entry,
                            paperId,
                            statementId: statement.id,
                            description
                        };
                    })
                    .reverse();
            } else if ([CLASSES.TEXT_SECTION].includes(type)) {
                const contentStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_CONTENT);
                sectionData.content = {
                    id: contentStatement?.object?.id,
                    text: contentStatement?.object?.label
                };

                const headingStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_HEADING_LEVEL);
                sectionData.heading = {
                    id: headingStatement?.object?.id,
                    level: headingStatement?.object?.label
                };
            }

            sections.push(sectionData);
        }

        const contributors = getAllContributors(statements);

        return {
            id: paramId,
            literatureList: {
                id: listResource.id,
                title: listResource.label
            },
            authorResources: authorResources.reverse(),
            sections: sections.reverse(),
            isPublished,
            versions,
            researchField,
            statements,
            contributors,
            papers
        };
    }, []);

    const getPaperDataFromStatements = ({ paperResource, statements }) => ({
        paper: paperResource,
        authors: getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_AUTHOR, paperResource.id).reverse(),
        month: getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_PUBLICATION_MONTH, paperResource.id)?.[0],
        year: getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_PUBLICATION_YEAR, paperResource.id)?.[0],
        doi: getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_DOI, paperResource.id),
        publishedIn: getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_VENUE, paperResource.id),
        url: getObjectsByPredicateAndSubject(statements, PREDICATES.URL, paperResource.id),
        contributions: getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_CONTRIBUTION, paperResource.id)
    });

    const getPaperData = async paperId => {
        const statements = await getStatementsBySubject({ id: paperId });
        const paperResource = await getResource(paperId);
        return getPaperDataFromStatements({ paperResource, statements });
    };

    const getAllContributors = statements => {
        if (statements.length === 0) {
            return [];
        }
        const contributors = statements
            .flatMap(statement => [statement.subject.created_by, statement.object.created_by, statement.created_by])
            .filter(contributor => contributor !== MISC.UNKNOWN_ID);

        const statementAmountPerContributor = countBy(contributors);
        const contributorsWithPercentage = Object.keys(statementAmountPerContributor).map(contributorId => ({
            id: contributorId,
            percentage: Math.round((statementAmountPerContributor[contributorId] / contributors.length) * 100)
        }));

        return orderBy(contributorsWithPercentage, 'percentage', 'desc');
    };

    const load = useCallback(
        async id => {
            setIsLoading(true);
            const literatureList = await getListById(id);

            if (literatureList) {
                dispatch(listLoaded(literatureList));
            }
            setIsLoading(false);
        },
        [dispatch, getListById]
    );

    const getVersions = async listId => {
        const statements = await getStatementsByObjectAndPredicate({ objectId: listId, predicateId: PREDICATES.HAS_LIST });
        const ids = statements.map(version => version.subject.id);

        if (ids.length === 0) {
            return [];
        }
        const versionsStatements = await getStatementsBySubjects({ ids });

        return versionsStatements
            .map(versionSubject => ({
                ...versionSubject.statements.find(
                    statement =>
                        statement.subject.classes.includes(CLASSES.LITERATURE_LIST_PUBLISHED) && statement.predicate.id === PREDICATES.DESCRIPTION
                )
            }))
            .map(statement => ({
                id: statement.subject.id,
                date: statement.subject.created_at,
                description: statement.object.label,
                creator: statement.object.created_by
            }));
    };

    const notFound = () => {
        setIsNotFound(true);
        setIsLoading(false);
    };

    const getObjectsByPredicateAndSubject = (statements, predicateId, subjectId) => {
        return statements
            .filter(statement => statement.predicate.id === predicateId && statement.subject.id === subjectId)
            .map(statement => statement.object);
    };

    const getStatementsBySubjectId = (statements, subjectId) => {
        return statements.filter(statement => statement.subject.id === subjectId);
    };

    const getStatementsByObjectId = (statements, objectId) => {
        return statements.filter(statement => statement.object.id === objectId);
    };

    const publishList = async ({ id, updateMessage, listId }) => {
        try {
            const { statements } = await getStatementsBundleBySubject({
                id
            });
            const listTitle = statements.find(statement => statement.subject.id === id).subject.label;
            const versionResource = await createResource(listTitle, [CLASSES.LITERATURE_LIST_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);
            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(versionResource.id, PREDICATES.HAS_LIST, id);

            await createResourceData({
                resourceId: versionResource.id,
                data: { rootResource: id, statements }
            });

            const versions = await getVersions(listId);
            dispatch(versionsSet(versions));

            toast.success('List published successfully');
            return versionResource.id;
        } catch (e) {
            toast.error('An error occurred when publishing the list');
        }
    };

    return { load, isLoading, isNotFound, getListById, getVersions, publishList, getPaperDataFromStatements, getPaperData };
};

export default useLiteratureList;
