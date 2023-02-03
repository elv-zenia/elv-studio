import React, {useEffect} from "react";
import {useRouteMatch} from "react-router-dom";
import {observer} from "mobx-react";
import PrettyBytes from "pretty-bytes";

import {ingestStore} from "Stores";
import ImageIcon from "Components/common/ImageIcon";
import {PageLoader} from "Components/common/Loader";
import {Copyable} from "Components/common/Copyable";
import CheckmarkIcon from "Assets/icons/check.svg";
import LoadingIcon from "Assets/icons/loading.gif";
import InlineNotification from "Components/common/InlineNotification";

const JobDetails = observer(() => {
  const match = useRouteMatch();
  const jobId = match.params.id;

  useEffect(() => {
    ingestStore.SetJob(jobId);

    HandleIngest();
  }, []);

  const OpenObjectLink = ({libraryId, objectId}) => {
    rootStore.client.SendMessage({
      options: {
        operation: "OpenLink",
        libraryId,
        objectId
      },
      noResponse: true
    });
  };

  const HandleIngest = async () => {
    if(ingestStore.job.currentStep !== "create" || ingestStore.job.create.runState !== "finished") { return; }

    const {abr, access, copy, files, libraryId, title, accessGroup, description, s3Url, writeToken, playbackEncryption} = ingestStore.job.formData.master;
    const mezFormData = ingestStore.job.formData.mez;

    const response = await ingestStore.CreateProductionMaster({
      libraryId,
      files,
      title,
      description,
      s3Url,
      abr: abr ? JSON.parse(abr) : undefined,
      accessGroupAddress: accessGroup,
      access: JSON.parse(access),
      copy,
      masterObjectId: jobId,
      writeToken,
      playbackEncryption,
      mezContentType: ingestStore.job.mezContentType
    });

    if(!response) { return; }

    await new Promise(resolve => setTimeout(resolve, 2000));

    await ingestStore.WaitForPublish({
      hash: response.hash,
      objectId: jobId,
      libraryId: libraryId
    });

    await ingestStore.CreateABRMezzanine({
      libraryId: mezFormData.libraryId,
      masterObjectId: response.id,
      masterVersionHash: response.hash,
      abrProfile: response.abrProfile,
      type: response.contentTypeId,
      name: mezFormData.name,
      accessGroupAddress: mezFormData.accessGroup,
      description: mezFormData.description,
      displayName: mezFormData.displayName,
      newObject: mezFormData.newObject,
      access: JSON.parse(access)
    });
  };

  if(!ingestStore.job) { return <PageLoader />; }

  const DisplayError = () => {
    if(!ingestStore.jobs[jobId].error) { return null; }

    const fallbackErrorMessage = "Unable to create media playable object.";

    return (
      <div className="job-details__error">
        <InlineNotification
          type="error"
          message={ingestStore.jobs[jobId].errorMessage || fallbackErrorMessage}
          subtext={ingestStore.jobs[jobId].errorDetails}
          hideCloseButton={true}
        />
      </div>
    );
  };

  const JobInfo = () => {
    const infoValues = [
      {
        label: "Name",
        value: ingestStore.jobs[jobId].formData.master.title
      },
      {
        label: "Total File Size",
        value: PrettyBytes(ingestStore.jobs[jobId].size || 0)
      },
      {
        label: "ID",
        value: jobId
      },
      {
        label: "Library ID",
        value: ingestStore.jobs[jobId].formData.master.libraryId
      },
      {
        label: "Write Token",
        value: ingestStore.jobs[jobId].writeToken
      },
      {
        label: "Node URL",
        value: ingestStore.jobs[jobId].nodeUrl
      }
    ];

    return (
      <div className="job-details__job-info">
        {
          infoValues.map(({label, value}) => (
            <div key={`job-details-${label}`}>
              <span className="job-details__job-info__label">
                { `${label}:` }
              </span>
              <span>{ value || "" }</span>
            </div>
          ))
        }
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page__header">Details for {ingestStore.jobs[jobId].formData.master.title || jobId}</div>
      <div className="job-details">
        { JobInfo() }

        <h1 className="job-details__section-header">Progress Details</h1>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Uploading</div>
            <div className="job-details__card__text__description">
              {
                ["finished", "failed"].includes(ingestStore.jobs[jobId].upload.runState) ? "" : `${ingestStore.jobs[jobId].upload.percentage || 0}%`
              }
            </div>
          </div>
          {
            ingestStore.jobs[jobId].upload.runState === "failed" ?
              <div className={"job-details__card__failed-text"}>
                Failed
              </div> :
              <ImageIcon
                icon={ingestStore.jobs[jobId].upload.runState === "finished" ? CheckmarkIcon : LoadingIcon}
                className="job-details__card__icon"
                label={ingestStore.jobs[jobId].upload.runState === "finished" ? "Completed" : "In progress"}
              />
          }
        </div>

        <div className="job-details__card">
          <div className="job-details__card__text">
            <div>Converting to streaming format</div>
            <div className="job-details__card__text__description">
              {
                ingestStore.jobs[jobId].ingest.runState === "failed" ? "" : ingestStore.jobs[jobId].ingest.estimatedTimeLeft || ""
              }
            </div>
          </div>
          {
            ingestStore.jobs[jobId].ingest.runState === "failed" ?
              <div className={"job-details__card__failed-text"}>
                Failed
              </div> :
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
            ingestStore.jobs[jobId].finalize.runState === "failed" ?
              <div className={"job-details__card__failed-text"}>
                Failed
              </div> :
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
              <h1 className="job-details__section-header">Mezzanine Object Details</h1>
              <div className="job-details__card job-details__card--secondary">
                <div className="job-details__card__text">
                  <div>Hash</div>
                  <Copyable
                    className="job-details__card__text__description"
                    copy={ingestStore.jobs[jobId].finalize.mezzanineHash}
                  >
                    <div>
                      { ingestStore.jobs[jobId].finalize.mezzanineHash }
                    </div>
                  </Copyable>
                </div>
              </div>
              <div className="job-details__card job-details__card--secondary">
                <div className="job-details__card__text">
                  <div>ID</div>
                  <div className="job-details__card__text__description">
                    <button
                      type="button"
                      className="job-details__card__inline-link"
                      onClick={() => OpenObjectLink({
                        libraryId: ingestStore.jobs[jobId].formData.mez.libraryId,
                        objectId: ingestStore.jobs[jobId].finalize.objectId
                      })} >
                      <span>{ ingestStore.jobs[jobId].finalize.objectId }</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
        }
        { DisplayError() }
      </div>
    </div>
  );
});

export default JobDetails;
