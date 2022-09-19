import React from "react";
import {observer} from "mobx-react";
import {ingestStore} from "Stores";
import Table from "Components/common/Table";
import Dialog from "Components/common/Dialog";

const Jobs = observer(() => {
  if(!ingestStore.jobs || Object.keys(ingestStore.jobs).length === 0) {
    return <div className="page-container">No active jobs.</div>;
  }

  const statusMap = {
    "upload": "Uploading",
    "ingest": "Ingesting",
    "finalize": "Finalizing",
    "failed": "Failed"
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
              columns: [{label: "Object ID"}, {label: "Status"}, {gridActions: true}]
            }
          ]}
          rows={
            Object.keys(ingestStore.jobs).map(jobId => (
              {
                id: jobId,
                columns: [
                  {label: jobId},
                  {
                    label: ingestStore.jobs[jobId].finalize.complete ? "Complete" : statusMap[ingestStore.jobs[jobId].currentStep]
                  }
                ],
                gridActions: [
                  {label: "Retry", onClick: () => {}},
                  {label: "Cancel", onClick: () => {}},
                  {separator: true},
                  {label: "Remove", onClick: () => ingestStore.RemoveJob({id: jobId})}
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
