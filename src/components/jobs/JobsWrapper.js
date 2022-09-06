import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";
import {ingestStore} from "Stores";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    const localStorageJobs = localStorage.getItem("elv-jobs");
    if(localStorageJobs) {
      const parsedJobs = JSON.parse(atob(localStorageJobs));

      ingestStore.UpdateIngestJobs({jobs: parsedJobs});
    } else {
      ingestStore.UpdateIngestJobs({jobs: {}});
    }
  }, []);

  if(!ingestStore.jobs) { return <PageLoader />; }

  // const CreateProdMaster = async ({formData}) => {
  //   console.log("CreateProdMaster - formData", formData);
  //   const {abr, access, copy, files, libraryId, playbackEncryption, title, description, s3Url, writeToken, masterObjectId} = formData;
  //
  //   const response = await ingestStore.CreateProductionMaster({
  //     libraryId,
  //     masterObjectId,
  //     abr,
  //     files,
  //     title,
  //     description,
  //     s3Url,
  //     access,
  //     copy,
  //     writeToken,
  //     playbackEncryption
  //   });
  //
  //   console.log("master response", response);
  // };

  // const IngestJob = async ({formData}) => {
  //   console.log("IngestJob - formData", toJS(formData));
  //   const {libraryId, masterObjectId, masterVersionHash, abrProfile, type, name, description, displayName, newObject, access} = formData;
  //
  //   const mezResponse = await ingestStore.CreateABRMezzanine({
  //     libraryId,
  //     masterObjectId,
  //     masterVersionHash,
  //     abrProfile,
  //     type,
  //     name,
  //     description,
  //     displayName,
  //     newObject,
  //     access
  //   });
  //   console.log("mez response", mezResponse);
  // };

  // Object.keys(ingestStore.jobs).forEach(async (jobId) => {
  //   const jobData = ingestStore.jobs[jobId];
  //   console.log("jobs forEach - job", toJS(jobData));
  //
  //   if(jobData.currentStep === "create" && jobData.create.complete) {
  //     await CreateProdMaster({formData: jobData.formData.master});
  //   } else if(jobData.currentStep === "upload" && jobData.upload.complete) {
  //     await IngestJob({formData: jobData.formData.mez});
  //   }
  // });

  return children;
});

export default JobsWrapper;
