import React, {useEffect} from "react";
import {useRouteMatch} from "react-router-dom";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import ImageIcon from "Components/common/ImageIcon";
import {PageLoader} from "Components/common/Loader";
import CheckmarkIcon from "Assets/icons/check.svg";
import LoadingIcon from "Assets/icons/loading.gif";
import {toJS} from "mobx";

const JobDetails = observer(() => {
  const match = useRouteMatch();
  const jobId = match.params.id;

  useEffect(() => {
    ingestStore.SetJob(jobId);

    HandleIngest();
  }, []);

  const HandleIngest = async () => {
    if(ingestStore.job.currentStep !== "create" || !ingestStore.job.create.complete) { return; }

    const {abr, access, copy, files, libraryId, title, description, s3Url, writeToken} = ingestStore.job.formData.master;
    const mezFormData = ingestStore.job.formData.mez;

    const response = await ingestStore.CreateProductionMaster({
      libraryId,
      abr,
      files,
      title,
      description,
      s3Url,
      access: toJS(access),
      copy,
      masterObjectId: jobId,
      writeToken
    });

    await ingestStore.CreateABRMezzanine({
      libraryId: mezFormData.libraryId,
      masterObjectId: response.id,
      masterVersionHash: response.hash,
      abrProfile: JSON.parse(JSON.stringify(response.abrProfile)),
      type: response.contentTypeId,
      name: mezFormData.name,
      description: mezFormData.description,
      displayName: mezFormData.displayName,
      newObject: mezFormData.newObject,
      access: JSON.parse(JSON.stringify(response.access))
    });
  };

  if(!ingestStore.job) { return <PageLoader />; }

  return (
    <div className="page-container">
      <div className="page__header">Details for Ingest Job {jobId}</div>
      <div className="job-details">
        <h1 className="job-details__section-header">Progress Details</h1>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Uploading</div>
            <div className="job-details__card__text__description">{ ingestStore.jobs[jobId].upload.complete ? "" : `${ingestStore.jobs[jobId].upload.percentage || 0}%` }</div>
          </div>
          <ImageIcon
            icon={ingestStore.jobs[jobId].upload.complete ? CheckmarkIcon : LoadingIcon}
            className="job-details__card__icon"
            label={ingestStore.jobs[jobId].upload.complete ? "Completed" : "In progress"}
          />
        </div>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Converting to streaming format</div>
            <div className="job-details__card__text__description">{ ingestStore.jobs[jobId].ingest.estimatedTimeLeft || "" }</div>
          </div>
          {
            ["ingest", "finalize"].includes(ingestStore.jobs[jobId].currentStep) &&
            <ImageIcon
              icon={ingestStore.jobs[jobId].ingest.runState === "finished" ? CheckmarkIcon : LoadingIcon}
              className="job-details__card__icon"
              label={ingestStore.jobs[jobId].ingest.runState === "finished" ? "Completed" : "In progress"}
            />
          }
        </div>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Finalizing</div>
          </div>
          {
            ingestStore.jobs[jobId].currentStep === "finalize" &&
            <ImageIcon
              icon={CheckmarkIcon}
              className="job-details__card__icon"
              label="Completed"
            />
          }
        </div>

        {
          ingestStore.jobs[jobId].finalize.mezzanineHash &&
            <>
              <h1 className="job-details__section-header">File Details</h1>
              <div className="job-details__section-flexbox">
                <span>Mezzanine hash</span>
                <span>{ ingestStore.jobs[jobId].finalize.mezzanineHash }</span>
              </div>
              <div className="job-details__section-flexbox">
                <span>Mezzanine object id</span>
                <span>{ ingestStore.jobs[jobId].finalize.objectId }</span>
              </div>
            </>
        }
      </div>
    </div>
  );
});

export default JobDetails;
