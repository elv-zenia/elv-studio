import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {observer} from "mobx-react-lite";
import PrettyBytes from "pretty-bytes";

import {ingestStore, rootStore} from "@/stores";
import {PageLoader} from "@/components/common/Loader";
import {CheckmarkIcon, ClipboardIcon, ExclamationCircleIcon} from "@/assets/icons";
import Dialog from "@/components/common/Dialog";
import JSONView from "@/components/common/JSONView";
import {
  ActionIcon,
  Alert,
  Box, Button,
  CopyButton,
  Flex,
  Loader,
  Text,
  Title,
  Tooltip
} from "@mantine/core";
import styles from "./JobDetails.module.css";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import JobDetailsCard from "@/pages/job-details/card/JobDetailsCard.jsx";

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

const FinalizeInfo = observer(({jobId}) => {
  if(!ingestStore.jobs[jobId].finalize.mezzanineHash) { return null; }

  return (
    <>
      <h1 className="job-details__section-header">Mezzanine Object Details</h1>
      <JobDetailsCard
        label="Hash"
        value={ingestStore.jobs[jobId].finalize.mezzanineHash}
        secondary
        type="COPY"
      />
      <JobDetailsCard
        label="ID"
        value={ingestStore.jobs[jobId].finalize.objectId}
        secondary
        type="LINK"
        LinkCallback={() => OpenObjectLink({
          libraryId: ingestStore.jobs[jobId].formData?.mez.libraryId,
          objectId: ingestStore.jobs[jobId].finalize.objectId
        })}
      />
      <JobDetailsCard
        label="Embeddable URL"
        value={ingestStore.jobs[jobId].embedUrl}
        secondary
        type="LINK"
      />
    </>
  );
});

const ErrorNotification = observer(({jobId, setShowErrorDialog}) => {
  if(!ingestStore.jobs[jobId].error) { return null; }

  const fallbackErrorMessage = "Unable to create media playable object.";

  return (
    <Box>
      <Alert
        variant="light"
        color="var(--mantine-color-elv-red-8)"
        classNames={{wrapper: styles.alertWrapper}}
        icon={<ExclamationCircleIcon />}
      >
        <Flex justify="space-between" align="center">
          { ingestStore.jobs[jobId].errorMessage || fallbackErrorMessage }
          {
            ingestStore.jobs[jobId].errorLog &&
            (
              <Button variant="transparent" onClick={() => setShowErrorDialog(true)} className={styles.textButton}>
                Learn More
              </Button>
            )
          }
        </Flex>
      </Alert>
    </Box>
  );
});

const ErrorDialog = observer(({jobId, showErrorDialog, setShowErrorDialog}) => {
  if(!showErrorDialog) { return null; }

  return (
    <Dialog
      open={showErrorDialog}
      onOpenChange={() => setShowErrorDialog(false)}
      title={`Error Log for ${ingestStore.jobs[jobId].formData?.master.title || jobId}`}
      hideCancelButton={true}
      confirmText="Close"
      size="MD"
    >
      <JSONView json={ingestStore.jobs[jobId].errorLog} copyable={true} />
    </Dialog>
  );
});

const JobInfo = ({jobId}) => {
  const separateMasterMez = ingestStore.jobs[jobId].formData?.mez.newObject;

  const idPrefix = separateMasterMez ? "master" : "master-mez";

  const masterValues = [
    {
      label: separateMasterMez ? "Master" : "Master + Mezzanine",
      id: `${idPrefix}-header`,
      value: ""
    },
    {
      label: "ID",
      id: `${idPrefix}-id`,
      value: jobId,
      indent: true
    },
    {
      label: "Library ID",
      id: `${idPrefix}-library-id`,
      value: ingestStore.jobs[jobId].masterLibraryId || "",
      indent: true
    },
    {
      label: "Write Token",
      id: `${idPrefix}-write-token`,
      value: ingestStore.jobs[jobId].masterWriteToken || "",
      copyable: true,
      indent: true
    },
    {
      label: "Node URL",
      id: `${idPrefix}-node-url`,
      value: ingestStore.jobs[jobId].masterNodeUrl || "",
      indent: true
    }
  ];

  const mezValues = [
    {
      label: "Mezzanine",
      id: "mez-header",
      value: ""
    },
    {
      label: "ID",
      id: "mez-id",
      value: ingestStore.jobs[jobId].mezObjectId || "",
      indent: true
    },
    {
      label: "Library ID",
      id: "mez-library-id",
      value: ingestStore.jobs[jobId].mezLibraryId || "",
      indent: true
    },
    {
      label: "Write Token",
      id: "mez-write-token",
      value: ingestStore.jobs[jobId].mezWriteToken || "",
      copyable: true,
      indent: true
    },
    {
      label: "Node URL",
      id: "mez-node-url",
      value: ingestStore.jobs[jobId].mezNodeUrl || "",
      indent: true,
      hidden: !ingestStore.jobs[jobId].mezNodeUrl
    }
  ];

  let infoValues = [
    {
      label: "Name",
      id: "object-name",
      value: ingestStore.jobs[jobId].formData?.master.title
    },
    {
      label: "Total File Size",
      id: "object-total-size",
      value: PrettyBytes(ingestStore.jobs[jobId].size || 0),
      hidden: ingestStore.jobs[jobId].size === undefined
    },
    {
      label: "Content Type",
      id: "object-content-type",
      value: ingestStore.jobs[jobId].contentType || ""
    },
    ...masterValues
  ];

  if(separateMasterMez) {
    infoValues = infoValues.concat(mezValues);
  }

  return (
    <Box w="100%">
      {
        infoValues
          .filter(item => !item.hidden)
          .map(({label, value, copyable, indent, id}) => (
            <Flex
              key={`job-details-${id}`}
              gap={8}
              style={{marginLeft: indent ? "1.5rem" : 0, width: indent ? "calc(100% - 1.5rem)" : "100%"}}
            >
              <Text fw={500} className="job-details__job-info__label">
                { `${label}:` }
              </Text>
              <Text className="job-details__job-info__value">{ value || "" }</Text>
              {
                copyable && value &&
                <CopyButton value={value}>
                  {({copied, copy}) => (
                    <Tooltip
                      label={copied ? "Copied" : "Copy"}
                      withArrow
                      position="right"
                    >
                      <ActionIcon
                        onClick={copy}
                        size="xs"
                        variant="transparent"
                        color="elv-gray.1"
                      >
                        <ClipboardIcon color="var(--mantine-color-elv-neutral-5)" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              }
            </Flex>
          ))
      }
    </Box>
  );
};

const JobDetails = observer(() => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const params = useParams();
  const jobId = params.id;

  useEffect(() => {
    ingestStore.SetJob(jobId);

    HandleIngest();
  }, []);

  const HandleIngest = async () => {
    if(ingestStore.job.currentStep !== "create" || ingestStore.job.create.runState !== "finished") { return; }

    const {abr, access, copy, files, libraryId, title, accessGroup, description, s3Url, writeToken, playbackEncryption} = ingestStore.job.formData.master;
    const mezFormData = ingestStore.job.formData.mez;
    const {contentType} = ingestStore.job.formData;

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
      displayTitle: mezFormData.displayTitle
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
      type: contentType,
      name: mezFormData.name,
      accessGroupAddress: mezFormData.accessGroup,
      description: mezFormData.description,
      displayTitle: mezFormData.displayTitle,
      newObject: mezFormData.newObject,
      access: JSON.parse(access),
      permission: mezFormData.permission
    });
  };

  if(!ingestStore.job) { return <PageLoader />; }

  const iconProps = {
    width: 20,
    height: 20
  };

  return (
    <PageContainer title={`Details for ${ingestStore.jobs[jobId].formData?.master.title || jobId}`} width="725px">
      <div className="job-details">
        <JobInfo jobId={jobId} />

        <Title order={5} mt={16} mb={16}>Progress Details</Title>

        <TextCard
          title="Uploading"
          message={
            ["finished", "failed"].includes(ingestStore.jobs[jobId].upload.runState) ? null : `${ingestStore.jobs[jobId].upload.percentage || 0}%`
          }
          rightSection={
            ingestStore.jobs[jobId].upload.runState === "failed" ?
              <div className={"job-details__card__failed-text"}>
                Failed
              </div> :
              ingestStore.jobs[jobId].upload.runState === "finished" ?
                <CheckmarkIcon {...iconProps} /> : <Loader size={20} />
          }
        />

        <TextCard
          title="Converting to streaming format"
          message={
            ingestStore.jobs[jobId].ingest.runState === "failed" ? "" : ingestStore.jobs[jobId].ingest.estimatedTimeLeft || ""
          }
          rightSection={
            ingestStore.jobs[jobId].ingest.runState === "failed" ?
              <div className={"job-details__card__failed-text"}>
                Failed
              </div> :
              ["ingest", "finalize"].includes(ingestStore.jobs[jobId].currentStep) &&
              (
                ingestStore.jobs[jobId].ingest.runState === "finished" ? <CheckmarkIcon {...iconProps} /> : <Loader size={20} />
              )
          }
        />

        <TextCard
          title="Finalizing"
          rightSection={
            ingestStore.jobs[jobId].finalize.runState === "failed" ?
              <div className={"job-details__card__failed-text"}>
                Failed
              </div> :
              ingestStore.jobs[jobId].currentStep === "finalize" &&
              <CheckmarkIcon {...iconProps} />
          }
        />

        <FinalizeInfo jobId={jobId} />
        <ErrorNotification jobId={jobId} setShowErrorDialog={setShowErrorDialog} />
        <ErrorDialog
          jobId={jobId}
          showErrorDialog={showErrorDialog}
          setShowErrorDialog={setShowErrorDialog}
        />
      </div>
    </PageContainer>
  );
});

export default JobDetails;
