import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {PageLoader} from "Components/common/Loader";
import {ingestStore} from "Stores";
import {toJS} from "mobx";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    ingestStore.LoadJobs();
    ingestStore.StartJobs();
  }, []);

  console.log("JobsWrapper", toJS(ingestStore.jobs));

  // const HandleIngest = async () => {
  //   for(let jobId of Object.keys(ingestStore.jobs || {})) {
  //     const job = ingestStore.jobs[jobId];
  //     console.log("job", toJS(job))
  //
  //     const {abr, access, copy, files, libraryId, title, description, s3Url, writeToken, playbackEncryption} = job.formData.master;
  //     const mezFormData = job.formData.mez;
  //
  //     let response;
  //     if(job.currentStep === "create" && job.create.complete) {
  //       response = await ingestStore.CreateProductionMaster({
  //         libraryId,
  //         files,
  //         title,
  //         description,
  //         s3Url,
  //         abr: JSON.parse(abr),
  //         access: JSON.parse(access),
  //         copy,
  //         masterObjectId: jobId,
  //         writeToken,
  //         playbackEncryption
  //       });
  //
  //       await new Promise(resolve => setTimeout(resolve, 2000));
  //
  //       await ingestStore.WaitForPublish({
  //         hash: response.hash,
  //         objectId: jobId
  //       });
  //     }
  //
  //     if(job.currentStep === "ingest" && !job.ingest.runState) {
  //       await ingestStore.CreateABRMezzanine({
  //         libraryId: mezFormData.libraryId,
  //         masterObjectId: response.id,
  //         masterVersionHash: response.hash,
  //         abrProfile: response.abrProfile,
  //         type: response.contentTypeId,
  //         name: mezFormData.name,
  //         description: mezFormData.description,
  //         displayName: mezFormData.displayName,
  //         newObject: mezFormData.newObject,
  //         access: JSON.parse(access)
  //       });
  //     }
  //   }
  // };

  if(!ingestStore.jobs) { return <PageLoader />; }

  return children;
});

export default JobsWrapper;
