import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";
import {ingestStore} from "Stores";
import {Base64} from "Utils/Base64";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    const localStorageJobs = localStorage.getItem("elv-jobs");
    if(localStorageJobs) {
      const parsedJobs = JSON.parse(Base64.decode(localStorageJobs));

      ingestStore.UpdateIngestJobs({jobs: parsedJobs});
    } else {
      ingestStore.UpdateIngestJobs({jobs: {}});
    }
  }, []);

  if(!ingestStore.jobs) { return <PageLoader />; }

  return children;
});

export default JobsWrapper;
