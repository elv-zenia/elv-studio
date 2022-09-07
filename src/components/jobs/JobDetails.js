import React, {useEffect} from "react";
import {useRouteMatch} from "react-router-dom";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import ImageIcon from "Components/common/ImageIcon";
// import {PageLoader} from "Components/common/Loader";
import CheckmarkIcon from "Assets/icons/check.svg";
import LoadingIcon from "Assets/icons/loading.gif";

const JobDetails = observer(() => {
  const match = useRouteMatch();
  const jobId = match.params.id;

  useEffect(() => {
    ingestStore.SetJob(jobId);
  }, []);

  // if(!ingestStore.job) { return <PageLoader />; }

  return (
    <div className="page-container">
      <div className="page__header">Details for Ingest Job {jobId}</div>
      <div className="job-details">
        <h1 className="job-details__section-header">Progress Details</h1>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Uploading</div>
            <div className="job-details__card__text__description">{ ingestStore.job.upload.complete ? "" : `${ingestStore.job.upload.percentage || 0}%` }</div>
          </div>
          <ImageIcon
            icon={ingestStore.job.upload.complete ? CheckmarkIcon : LoadingIcon}
            className="job-details__card__icon"
            label={ingestStore.job.upload.complete ? "Completed" : "In progress"}
          />
        </div>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Converting to streaming format</div>
            <div className="job-details__card__text__description">{ ingestStore.job.ingest.estimatedTimeLeft || "" }</div>
          </div>
          {
            ["ingest", "finalize"].includes(ingestStore.job.currentStep) &&
            <ImageIcon
              icon={ingestStore.job.ingest.runState === "finished" ? CheckmarkIcon : LoadingIcon}
              className="job-details__card__icon"
              label={ingestStore.job.ingest.runState === "finished" ? "Completed" : "In progress"}
            />
          }
        </div>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Finalizing</div>
          </div>
          {
            ingestStore.job.currentStep === "finalize" &&
            <ImageIcon
              icon={CheckmarkIcon}
              className="job-details__card__icon"
              label="Completed"
            />
          }
        </div>
      </div>
    </div>
  );
});

export default JobDetails;
