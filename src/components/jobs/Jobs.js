import React from "react";
import {observer} from "mobx-react";
import {ingestStore} from "Stores";
import Table from "Components/common/Table";
import Dialog from "Components/common/Dialog";

const Jobs = observer(() => {
  if(!ingestStore.jobs || Object.keys(ingestStore.jobs).length === 0) {
    return <div className="page-container">No active jobs.</div>;
  }

  const JobStatus = ({job}) => {
    const statusMap = {
      "upload": "Uploading",
      "ingest": "Ingesting",
      "finalize": "Finalizing"
    };

    if(job.finalize.runState === "finished") {
      return "Complete";
    } else if(job.error) {
      return "Failed";
    } else {
      let statusMessage = statusMap[job.currentStep];
      if(job.currentStep === "upload") {
        statusMessage = `${statusMessage} ${job.upload.percentage ? `${job.upload.percentage}%` : ""}`;
      } else if(job.currentStep === "ingest") {
        statusMessage = `${statusMessage} ${job.ingest.estimatedTimeLeft || ""}`;
      }

      return statusMessage;
    }
  };

  return (
    <div className="page-container">
      <div className="page__header">Active Ingest Jobs</div>
      <div className="jobs">
        <Dialog
          title="Clear Jobs"
          description="Are you sure you want to clear all jobs? This action cannot be undone."
          trigger={(
            <button
              className="primary-button jobs__button"
              type="button"
            >
              Clear All Jobs
            </button>
          )}
          ConfirmCallback={ingestStore.ClearJobs}
        />
        <Table
          headers={[
            {
              key: "jobs-header",
              cells: [
                {label: "Name"},
                {label: "Object ID"},
                {label: "Status"}
              ]
            }
          ]}
          rows={
            Object.keys(ingestStore.jobs).map(jobId => (
              {
                id: jobId,
                cells: [
                  {
                    label: (
                      ingestStore.jobs[jobId].formData &&
                      ingestStore.jobs[jobId].formData.master &&
                      ingestStore.jobs[jobId].formData.master.title
                    )
                  },
                  {label: jobId},
                  {
                    label: JobStatus({job: ingestStore.jobs[jobId]})
                  }
                ]
              }
            ))
          }
        />
      </div>
    </div>
  );
});

export default Jobs;
