import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

function sendEMail({ url , title }){
  const eMailBody =
      'Dear <>,%0D%0AI am creating a comparison on Open Research Knowledge Graph(ORKG) named: "' +
      title +
      '" , and I need your help to improve it. Please have a few minutes to review it, and here is a link to this review: ' +
      url +
      '%0D%0A Best regards, %0D%0A<YOUR NAME>';
  const eMailSubject = 'I need your help to review my comparison: ' + title;
  const mailObject = [];
  mailObject.push(<Tippy content="Email this review to someone else to review it!">
        <a href={'mailto:someone@yoursite.com?subject=' + eMailSubject + '&body= ' + eMailBody}>
            <Icon icon={faEnvelope} className="me-2" />
        </a>
    </Tippy>);
    return { mailObject };
};
export default sendEMail;
