import WithAuth from "./WithAuth";
import { FunctionComponent } from 'react';

const ProtectedPage: FunctionComponent = () => {

  return (
    <div>
      <WithAuth />
      <h1>Page with protect</h1>
    </div>
  );
};

export default ProtectedPage;
