import React from "react";
import {useRouteMatch} from "react-router-dom";
import {observer} from "mobx-react";
import {ingestStore} from "Stores";

const JobDetails = observer(() => {
  const match = useRouteMatch();
  const jobId = match.params.id;
  const job = ingestStore.GetIngestJob(jobId);
  console.log(job);

  return (
    <div className="page-container">
      <div className="page__header">Details for Ingest {jobId}</div>
    </div>
  );
});

export default JobDetails;
