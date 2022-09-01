import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    if(!rootStore.loaded) { return <PageLoader />; }
  }, []);

  return children;
});

export default JobsWrapper;
