import {useState} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores";
import Dialog from "@/components/common/Dialog";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import {DataTable} from "mantine-datatable";
import {useNavigate} from "react-router-dom";
import {Text} from "@mantine/core";

import styles from "./Jobs.module.css";

const Jobs = observer(() => {
  const [showClearJobsDialog, setShowClearJobsDialog] = useState(false);
  const navigate = useNavigate();

  if(!ingestStore.jobs || Object.keys(ingestStore.jobs).length === 0) {
    return <div className="page-container">No active jobs.</div>;
  }

  const JobStatus = ({
    currentStep,
    uploadPercentage,
    estimatedTimeLeft,
    runState,
    error
  }) => {
    const statusMap = {
      "upload": "Uploading",
      "ingest": "Ingesting",
      "finalize": "Finalizing"
    };

    if(runState === "finished") {
      return "Complete";
    } else if(error) {
      return "Failed";
    } else {
      let statusMessage = statusMap[currentStep];
      if(currentStep === "upload") {
        statusMessage = `${statusMessage} ${uploadPercentage ? `${uploadPercentage}%` : ""}`;
      } else if(currentStep === "ingest") {
        statusMessage = `${statusMessage} ${estimatedTimeLeft || ""}`;
      }

      return statusMessage;
    }
  };

  const records = Object.keys(ingestStore.jobs || {}).map(id => {
    const item = ingestStore.jobs[id];
    item["_title"] = item.formData?.master?.title;
    item["_objectId"] = id;
    return item;
  });

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
        <DataTable
          withTableBorder
          highlightOnHover
          idAccessor="_objectId"
          minHeight={!records || records.length === 0 ? 150 : 75}
          records={records}
          onRowClick={({record}) => {
            navigate(record._objectId);
          }}
          rowClassName={() => styles.row}
          columns={[
            { accessor: "_title", title: "Name", sortable: true, render: record => <Text>{ record._title }</Text> },
            { accessor: "_objectId", title: "Object ID", sortable: true, render: record => <Text>{ record._objectId }</Text> },
            {
              accessor: "_status",
              title: "Status",
              render: record => (
                <Text>
                  {
                    JobStatus({
                      uploadPercentage: record.upload?.percentage,
                      currentStep: record.currentStep,
                      estimatedTimeLeft: record.ingest?.estimatedTimeLeft,
                      runState: record.finalize?.runState,
                      error: record.error
                    })
                  }
                </Text>
              )
            }
          ]}
        />
      </div>
    </PageContainer>
  );
});

export default Jobs;
