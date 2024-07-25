import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {PageLoader} from "@/components/common/Loader";
import {ingestStore, rootStore} from "@/stores";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    const localStorageJobs = localStorage.getItem("elv-jobs");
    if(localStorageJobs) {
      const parsedJobs = JSON.parse(rootStore.Decode(localStorageJobs));

      ingestStore.UpdateIngestJobs({jobs: parsedJobs});
    } else {
      ingestStore.UpdateIngestJobs({jobs: {}});
    }
  }, []);

  if(!ingestStore.jobs) { return <PageLoader />; }

  return children;
});

export default JobsWrapper;
