import * as type from './types.js';
import { guid } from '../utils';
import WordsNinjaPack from 'wordsninja';

export const createAnnotation = annotation => async dispatch => {
    const WordsNinja = new WordsNinjaPack();
    await WordsNinja.loadDictionary();
    const words = WordsNinja.splitSentence(annotation.content.text, { joinWords: true });
    console.log(words);

    dispatch({
        type: type.PDF_TEXT_ANNOTATION_CREATE_ANNOTATION,
        payload: {
            id: guid(),
            ...annotation
        }
    });
};

export const deleteAnnotation = annotationId => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_DELETE_ANNOTATION,
        payload: annotationId
    });
};

export const updateAnnotationText = payload => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_UPDATE_ANNOTATION,
        payload
    });
};

const toBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

export const uploadPdf = files => async dispatch => {
    if (files.length === 0) {
        return;
    }

    const pdf = files[0];
    const encodedPdf = await toBase64(files[0]);

    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_PDF,
        payload: {
            pdf: pdf,
            encodedPdf: encodedPdf
        }
    });
};
