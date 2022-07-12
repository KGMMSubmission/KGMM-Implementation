import { BulletList } from 'react-content-loader';
import styled from 'styled-components';

const BorderTopRadius = styled.div`
    width: 250px;
    border-radius: 11px 11px 0 0;
    overflow: hidden;
`;

function ReportLoader(){
return (
    <BorderTopRadius>
        <BulletList />
    </BorderTopRadius>
  );
};

export default ReportLoader;
