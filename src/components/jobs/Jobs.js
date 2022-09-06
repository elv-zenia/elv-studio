import React from "react";
import {observer} from "mobx-react";
import {ingestStore} from "Stores";
import Table from "Components/common/Table";

const Jobs = observer(() => {
  if(!ingestStore.jobs || Object.keys(ingestStore.jobs).length === 0) {
    return <div className="page-container">No active jobs.</div>;
  }

  const statusMap = {
    "upload": "Uploading",
    "ingest": "Ingesting",
    "finalize": "Finalizing"
  };

  return (
    <div className="page-container">
      <div className="page__header">Active Ingest Jobs</div>
      <div className="jobs">
        <Table
          headers={[
            {
              key: "jobs-header",
              cells: [{label: "Object ID"}, {label: "Status"}]
            }
          ]}
          rows={
            Object.keys(ingestStore.jobs).map(jobId => (
              {
                id: jobId,
                cells: [
                  {label: jobId},
                  {
                    label: ingestStore.jobs[jobId].finalize.complete ? "Complete" : statusMap[ingestStore.jobs[jobId].currentStep]
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
