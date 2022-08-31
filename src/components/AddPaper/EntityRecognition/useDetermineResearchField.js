import { RESOURCES } from 'constants/graphSettings';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getParentResearchFields } from 'services/backend/statements';

const useDetermineResearchField = () => {
    const { selectedResearchField } = useSelector(state => state.addPaper);
    const [isComputerScienceField, setIsComputerScienceField] = useState(false);

    useEffect(() => {
        const determineField = async () => {
            if (
                selectedResearchField === RESOURCES.RESEARCH_FIELD_COMPUTER_SCIENCE ||
                selectedResearchField === RESOURCES.RESEARCH_FIELD_COMPUTATIONAL_LINGUISTICS
            ) {
                setIsComputerScienceField(true);
                return;
            }
            const parentFields = await getParentResearchFields(selectedResearchField);
            setIsComputerScienceField(
                parentFields.some(
                    field =>
                        field.id === RESOURCES.RESEARCH_FIELD_COMPUTER_SCIENCE || field.id === RESOURCES.RESEARCH_FIELD_COMPUTATIONAL_LINGUISTICS,
                ),
            );
        };
        determineField();
    }, [selectedResearchField]);

    return { isComputerScienceField };
};

export default useDetermineResearchField;
