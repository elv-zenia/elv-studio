import {useState} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores";
import Table from "@/components/common/Table";
import Dialog from "@/components/common/Dialog";
import PageContainer from "@/components/page-container/PageContainer.jsx";

const Jobs = observer(() => {
  const [showClearJobsDialog, setShowClearJobsDialog] = useState(false);
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
    <PageContainer title="Ingest Jobs">
      <div className="jobs">
        <button
          className="primary-button jobs__button"
          type="button"
          onClick={() => setShowClearJobsDialog(true)}
        >
          Clear Inactive Jobs
        </button>
        {
          showClearJobsDialog &&
          <Dialog
            title="Clear Jobs"
            description="Are you sure you want to clear all inactive jobs? This action cannot be undone."
            ConfirmCallback={ingestStore.ClearInactiveJobs}
            open={showClearJobsDialog}
            onOpenChange={() => setShowClearJobsDialog(false)}
          />
        }
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
                link: `/jobs/${jobId}`,
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
    </PageContainer>
  );
});

export default Jobs;
