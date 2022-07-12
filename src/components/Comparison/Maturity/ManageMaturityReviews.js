import { useEffect, useState } from 'react';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Alert } from 'reactstrap';
import { getStatementsBySubjectAndPredicate, getStatementsBySubject } from 'services/backend/statements';
import { getResourceData } from 'services/similarity/index';
import SendEMail from 'components/Comparison/Maturity/SendEMail';

function ManageMaturityReviews({ data , metaData  ,isPublished, url/*, resourceId*/}){
  const id = metaData?.id || metaData?.hasPreviousVersion?.id;
  const [reviewsData, setReviewsData] = useState();
  const [maturityLevel, setMaturityLevel] = useState();
  const [maturityStars, setMaturityStars] = useState();
  const [uniqueReviewsProperties, setUniqueReviewsProperties] = useState();
  const [maturityReportMessage, setMaturityReportMessage] = useState();
  const [reviewsCount, setReviewsCount] = useState();
  const [votesCount, setVotesCount] = useState();
  const [mostSelectedReviewNumber, setMostSelectedReviewNumber] = useState();
  const [reviewsReportSummary, setReviewsReportSummary] = useState();
  const [currentVisualizationsCount, setCurrentVisualizationsCount] = useState(0);

  useEffect (() => {
     const getMaturityReviewsReportData =  () => {
       let itemSummary = [];
       let review = '';
       if(reviewsData !== null && typeof reviewsData === 'object' && Array.isArray(reviewsData) === false) {
         review = reviewsData[0];
         if(review !== null && typeof review === 'object' && Array.isArray(review) === false) {
           let reviewsDataKeys = Object.keys(review['data']);
           Object.keys(reviewsDataKeys).map(function(key,index) {
             itemSummary[reviewsDataKeys[key]] = getItemSummary('data.'+reviewsDataKeys[key],reviewsData);
           });
           setReviewsReportSummary(itemSummary);
         }
       }
     };

     const getItemSummary = (dynamicKeys,obj) => {
       const list = dynamicKeys.split('.');
       const op = {};
       for (let i = 0; i < Object.keys(obj).length; i++) {
         let n = 1, key='';
         if(obj[i] !== null && typeof obj[i] === 'object' && Array.isArray(obj[i]) === false) {
           key = obj[i][list[0]];
         }
         while (list.length > n) {
           key = key[list[n]];
           n++;
         }
         op[key] = op[key] ? op[key] + 1 : 1;
       }
       return op;
     }
     getMaturityReviewsReportData();
  }, [reviewsData, data]);

  useEffect (() => {
   const loadMinimumReviewsData = async () => {
     const votesData = await getStatementsBySubject({ id: 'R193548' });
     if(votesData) {
       let votes = [];
       let votesCounter = 0;
       let mostSelectedReview=0;
       let HighestReviewNumber = 0;
       Object.keys(votesData).map(function(key) {
         votesCounter = votesData.filter((obj) => obj.object.label === votesData[key].object.label).length;  // get each vote count
         votes[key] = new Array(votesData[key].object.label+' reviews',votesCounter);
         if(votesCounter > HighestReviewNumber){
           HighestReviewNumber = votesCounter;
           mostSelectedReview = votes[key][0].split(" ");
         }
         setMostSelectedReviewNumber(Number(mostSelectedReview[0]));
       });
       votes = votes.filter((v,i,a)=>a.findIndex(v2=>(v2[0]===v[0]))===i);   // remove duplicates from the array
       votes = votes.sort((a, b) => a[0].localeCompare(b[0])) // sort the array
       setVotesCount(votes);
     }
   };
   loadMinimumReviewsData();
 }, [/*resourceId*/]);

  useEffect (() => {
   const loadReviewsData = async () => {
     const statementsData = await getStatementsBySubjectAndPredicate({ subjectId: id, predicateId: 'P59027' });
     console.log(statementsData);
     if(statementsData) {
       let resourceData = {};
       Object.keys(statementsData).map( async function(key) {
         resourceData[key] = {...await getResourceData(statementsData[key].object.id)};
         setReviewsData(resourceData);
       });
     }
   };
   loadReviewsData();
  }, [id]);

  useEffect (() => {
   const getReviewsCount = () => {
     let count = 0;
     if(reviewsData !== null && typeof reviewsData === 'object' && Array.isArray(reviewsData) === false) {
       count = Object.keys(reviewsData).length;
     }
     setReviewsCount(count);
   };

   const extractUniqueReviewsProperties = () => {
     let reviewNewPropertyKey = 0;
     let suggestedProperties={};
     let i = 0;
     if(reviewsData !== null && typeof reviewsData === 'object') {
       Object.keys(reviewsData).map(function(key) {
        let review = reviewsData[Object.keys(reviewsData)[key]];
        console.log(review);
        if(review !== null && typeof review === 'object') {
          for (reviewNewPropertyKey in review['data']) {
            if (reviewNewPropertyKey.startsWith('newProperty')){
              if(isValueExists(data,review['data'][reviewNewPropertyKey]) === false && isValueExists(data,review['data'][reviewNewPropertyKey].toLowerCase()) === false){
                suggestedProperties[i] = review['data'][reviewNewPropertyKey];
                i++;
              }
              setUniqueReviewsProperties(suggestedProperties);
            }
          }
        }
      });
    }
   };
   getReviewsCount();
   extractUniqueReviewsProperties();
  }, [reviewsData, data]);

  const isValueExists = (object, value) => {
    let returned = false;
    (Object.values(object).indexOf(value) > -1 || object[value]!== undefined) ? returned = true : returned = false;
    return returned;
  };

  const isEmpty = (obj) => {
    if(obj !== null && typeof obj === 'object' && Array.isArray(obj) === false)
    return Object.keys(obj).length === 0;
  };

useEffect (() => {
  const getMaturityLevel = () => {
    let level;
    let propertiesCount=0;
    let visualizationPercentage=0;
    if(uniqueReviewsProperties !== null && typeof uniqueReviewsProperties === 'object'){
      propertiesCount = Object.keys(uniqueReviewsProperties).length;
    }
    if(reviewsReportSummary !== null && typeof reviewsReportSummary === 'object' && Array.isArray(reviewsReportSummary) === true){
      visualizationPercentage =  (typeof reviewsReportSummary["visualization"]['true'] !== "undefined" && reviewsReportSummary["visualization"]['true'] != 0)? reviewsReportSummary["visualization"]['true']/reviewsCount*100 : 0;
    }
    if(metaData.visualizations !== null && typeof metaData.visualizations === 'object' && Array.isArray(metaData.visualizations) === true){
      setCurrentVisualizationsCount(Object.keys(metaData.visualizations).length);
    }
    if(propertiesCount <= 0 && reviewsCount >= mostSelectedReviewNumber) { // && (isPublished!=true || visualizationPercentage <50)
      // no properites to be added, 50%< reviews to add visualization, at least one visualization, and published
      level =3;
      if(isPublished==true){
        if(visualizationPercentage >= 50){
          if(currentVisualizationsCount >0){
            level =4;
            if(metaData.doi!=''){
              level =5;
            }
          }
        }
        else {
          if(metaData.doi!=''){
            level =5;
          }
          level =4;
        }
      }
    }
    else{
        level =1;
    }
    console.log(level);
    setMaturityLevel(level);
  };
  getMaturityLevel();
}, [reviewsCount, mostSelectedReviewNumber, uniqueReviewsProperties]);

useEffect (() => {
  const drawMaturityStars = () => {
    let stars = [];
    for(let i = 1; i <=5; i++ ){
      let color = (i > maturityLevel) ? "#8080804a" : "#000";
      stars.push(<Icon icon={faStar} key={i} className="me-1" style={{ color: color }} />);
    }
    setMaturityStars(stars);
  };

  const maturityReportMessage = () => {
    let color = '';
    let text =[];
    let maturityAlertColor = '';
    let finalMessage = [];
    switch(maturityLevel) {
      case  2:
        maturityAlertColor = 'secondary';
      break;
      case 3:
        maturityAlertColor = 'warning';
      break;
      case 4:
        maturityAlertColor = 'info';
      break;
      case 5:
        maturityAlertColor = 'success';
      break;
      default:
        maturityAlertColor = 'danger';
    }
    if (typeof mostSelectedReviewNumber !== undefined){
      if(reviewsCount >= mostSelectedReviewNumber){
        color = 'success';
        text.push('This comparison has reached the minimum needed number of reviews, which is '+mostSelectedReviewNumber+' and has now '+reviewsCount+' reviews');
      }
      else{
        color = 'danger';
        const { mailObject } = SendEMail({ url:url , title:metaData.title });
        let neededReviews = 0;
        (reviewsCount- mostSelectedReviewNumber < 0 )? neededReviews =  (reviewsCount- mostSelectedReviewNumber) * -1 : neededReviews = (reviewsCount- mostSelectedReviewNumber)
        text.push('This comparison still needs at least '+ neededReviews +' more reviews out of ('+reviewsCount+'/'+mostSelectedReviewNumber+') to improve its maturity. You can ask someone to review it for you  ');
        text.push(mailObject);
      }
    }

    finalMessage.push(<Alert color={maturityAlertColor}>This comparison is in maturity level <b>{maturityLevel}</b></Alert>);
    let reviewsText= <Alert color={color}>
        <b style={{ textDecoration: 'underline' }}>Please read</b>: <br />
        <ul>
           <li>{text}</li>
          <li>
            You need to check the reviews and make changes to the comparison if needed
          </li>
        </ul>
    </Alert>
    ;
    finalMessage.push(reviewsText);
    setMaturityReportMessage(finalMessage);
   };
   drawMaturityStars();
   maturityReportMessage();
 }, [reviewsCount, mostSelectedReviewNumber, maturityLevel, uniqueReviewsProperties]);
 return { mostSelectedReviewNumber, reviewsReportSummary, votesCount, reviewsCount, reviewsData, uniqueReviewsProperties, maturityLevel, maturityStars, maturityReportMessage, currentVisualizationsCount};
};

export default ManageMaturityReviews;
