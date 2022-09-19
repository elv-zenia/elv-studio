import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import Dropzone from "Components/common/Dropzone";
import FabricLoader from "Components/FabricLoader";
import {Input, TextArea, Select, JsonTextArea, Checkbox, Radio} from "Components/common/Inputs";
import {Redirect} from "react-router-dom";
import {s3Regions} from "Utils";

const Form = observer(() => {
  const [isCreating, setIsCreating] = useState(false);
  const [masterObjectId, setMasterObjectId] = useState();
  const [uploadMethod, setUploadMethod] = useState("local");
  const [files, setFiles] = useState([]);
  const [masterAbr, setMasterAbr] = useState();
  const [masterLibrary, setMasterLibrary] = useState();
  const [masterGroup, setMasterGroup] = useState();
  const [masterName, setMasterName] = useState();

  const [mezLibrary, setMezLibrary] = useState();
  const [mezGroup, setMezGroup] = useState();
  const [masterDescription, setMasterDescription] = useState();
  const [mezName, setMezName] = useState();
  const [mezDescription, setMezDescription] = useState();

  const [displayName, setDisplayName] = useState();
  const [playbackEncryption, setPlaybackEncryption] = useState();
  const [useMasterAsMez, setUseMasterAsMez] = useState(true);
  const [disableDrm, setDisableDrm] = useState(false);
  const [disableClear, setDisableClear] = useState(false);

  const [s3Url, setS3Url] = useState();
  const [s3Region, setS3Region] = useState();
  const [s3AccessKey, setS3AccessKey] = useState();
  const [s3Secret, setS3Secret] = useState();
  const [s3Copy, setS3Copy] = useState(false);
  const [s3PresignedUrl, setS3PresignedUrl] = useState();
  const [s3UseAKSecret, setS3UseAKSecret] = useState(false);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(masterLibrary)) { return; }

    const library = ingestStore.GetLibrary(masterLibrary);
    const abr = JSON.stringify(library.abr, null, 2) || "";
    const hasDrmCert = library.drmCert;

    setMasterAbr(abr);
    setDisableDrm(!hasDrmCert);
  }, [masterLibrary]);

  const dropzone = Dropzone({
    accept: {"audio/*": [], "video/*": []},
    id: "main-dropzone",
    onDrop: files => setFiles(files)
  });

  useEffect(() => {
    if(!masterAbr) {
      setDisableDrm(true);
      setDisableClear(true);
      return;
    }

    const parsedProfile = JSON.parse(masterAbr);
    const playoutFormats = Object.keys(
      parsedProfile &&
      parsedProfile.default_profile &&
      parsedProfile.default_profile.playout_formats || {}
    );

    const drm = playoutFormats.filter(formatName => !formatName.includes("clear"));
    const clear = playoutFormats.find(formatName => formatName.includes("clear"));

    setDisableDrm(drm.length === 0);
    setDisableClear(!clear);
  }, [masterAbr]);

  const LibraryAbrInput = ({
    onChange,
    library,
    required,
    value
  }) => {
    if(!library) { return null; }

    return (
      <JsonTextArea
        formName="abrProfile"
        label="ABR Profile Metadata"
        labelDescription="This should include both a default_profile and mez_content_type value, i.e. {default_profile: {}, mez_content_type: &quot;&quot;}"
        value={value}
        onChange={onChange}
        required={required}
      />
    );
  };

  const mezDetails = (
    <>
      <h1 className="form__section-header">Mezzanine Object Details</h1>
      <Select
        label="Library"
        labelDescription="This is the library where your mezzanine object will be created."
        formName="mezLibrary"
        required={true}
        options={
          Object.keys(ingestStore.libraries || {}).map(libraryId => (
            {
              label: ingestStore.libraries[libraryId].name || "",
              value: libraryId
            }
          ))
        }
        defaultOption={{
          value: "",
          label: "Select library"
        }}
        onChange={event => setMezLibrary(event.target.value)}
      />

      <Select
        label="AccessGroup"
        labelDescription="This is the Access Group you want to manage your master object."
        formName="mezGroup"
        required={false}
        options={
          Object.keys(ingestStore.accessGroups || {}).map(accessGroupName => (
            {
              label: accessGroupName,
              value: accessGroupName
            }
          ))
        }
        defaultOption={{
          value: "",
          label: "Select Access Group"
        }}
        onChange={event => setMezGroup(event.target.value)}
      />

      <Input
        label="Name"
        required={true}
        formName="mezName"
        onChange={event => setMezName(event.target.value)}
        value={mezName}
      />
      <Input
        label="Display Name"
        formName="displayName"
        onChange={event => setDisplayName(event.target.value)}
        value={displayName}
      />
      <Input
        label="Description"
        formName="mezDescription"
        onChange={event => setMezDescription(event.target.value)}
        value={mezDescription}
      />
    </>
  );

  const HandleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    let access = [];
    try {
      if(uploadMethod === "s3") {
        const s3prefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified
        const s3prefixMatch = (s3prefixRegex.exec(s3Url));

        const bucket = s3prefixMatch[1];

        const cloudCredentials = s3UseAKSecret ?
          {
            access_key_id: s3AccessKey,
            secret_access_key: s3Secret
          } :
          {
            signed_url: s3PresignedUrl
          };

        access = [{
          path_matchers: [".*"],
          remote_access: {
            protocol: "s3",
            platform: "aws",
            path: bucket + "/",
            storage_endpoint: {
              region: s3Region
            },
            cloud_credentials: cloudCredentials
          }
        }];
      }

      let accessGroup = ingestStore.accessGroups[masterGroup] ? ingestStore.accessGroups[masterGroup].address : undefined;
      let mezAccessGroupAddress = useMasterAsMez? accessGroup : ingestStore.accessGroups[mezGroup] ? ingestStore.accessGroups[mezGroup].address : undefined;

      const createResponse = await ingestStore.CreateContentObject({
        libraryId: masterLibrary,
        mezContentType: JSON.parse(masterAbr).mez_content_type,
        formData: {
          master: {
            abr: masterAbr,
            libraryId: masterLibrary,
            accessGroup,
            files: uploadMethod === "local" ? files : undefined,
            title: masterName,
            description: masterDescription,
            s3Url: uploadMethod === "s3" ? s3Url : undefined,
            playbackEncryption,
            access: JSON.stringify(access, null, 2) || "",
            copy: s3Copy
          },
          mez: {
            libraryId: useMasterAsMez ? masterLibrary : mezLibrary,
            accessGroup: mezAccessGroupAddress,
            name: useMasterAsMez ? masterName : mezName,
            description: useMasterAsMez ? masterDescription : mezDescription,
            displayName,
            newObject: !useMasterAsMez
          }
        }
      });

      setMasterObjectId(createResponse.id);
    } finally {
      setIsCreating(false);
    }
  };

  if(masterObjectId) { return <Redirect to={`jobs/${masterObjectId}`} />; }

  return (
    <FabricLoader>
      <div className="page-container">
        <div className="page__header">Ingest New Media</div>
        <form className="form" onSubmit={HandleSubmit}>
          <Radio
            label="Upload Method:"
            formName="uploadMethod"
            options={[
              {
                optionLabel: "Local file",
                id: "local",
                value: "local",
                checked: uploadMethod === "local",
                onChange: event => setUploadMethod(event.target.value)
              },
              {
                optionLabel: "S3 Bucket",
                id: "s3",
                value: "s3",
                checked: uploadMethod === "s3",
                onChange: event => setUploadMethod(event.target.value)
              }
            ]}
          />

          {
            uploadMethod === "local" &&
              <>
                { dropzone }
                <label>{ files.length === 1 ? "File:" : "Files:" }</label>
                <div className="file-names">
                  {
                    files.map((file, index) => (
                      <div key={`${file.name || file.path}-${index}`}>{file.name || file.path}</div>
                    ))
                  }
                </div>
              </>
          }

          {/* S3 Details */}
          {
            uploadMethod === "s3" && <>
              <Input
                label="S3 URI"
                formName="s3Url"
                value={s3Url}
                onChange={event => setS3Url(event.target.value)}
                placeholder="s3://BUCKET_NAME/PATH_TO_MEDIA.mp4"
                required={uploadMethod === "s3"}
              />

              <Select
                label="Region"
                formName="s3Region"
                options={
                  s3Regions.map(({value, name}) => (
                    {value, label: name}
                  ))
                }
                defaultOption={{
                  value: "",
                  label: "Select region"
                }}
                onChange={event => setS3Region(event.target.value)}
              />

              <Checkbox
                label="Use access key and secret"
                value={s3UseAKSecret}
                checked={s3UseAKSecret}
                onChange={event => setS3UseAKSecret(event.target.checked)}
              />

              {
                !s3UseAKSecret &&
                <TextArea
                  label="Presigned URL"
                  value={s3PresignedUrl}
                  onChange={event => setS3PresignedUrl(event.target.value)}
                  required={uploadMethod === "s3" && !s3UseAKSecret}
                />
              }
              {
                s3UseAKSecret &&
                  <>
                    <Input
                      label="Access key"
                      formName="s3AccessKey"
                      value={s3AccessKey}
                      onChange={event => setS3AccessKey(event.target.value)}
                      type="password"
                      required={uploadMethod === "s3"}
                    />

                    <Input
                      label="Secret"
                      formName="s3Secret"
                      value={s3Secret}
                      onChange={event => setS3Secret(event.target.value)}
                      type="password"
                      required={uploadMethod === "s3"}
                    />
                  </>
              }

              <Checkbox
                label="Copy file onto the fabric"
                value={s3Copy}
                checked={s3Copy}
                onChange={event => setS3Copy(event.target.checked)}
              />
            </>
          }

          <h1 className="form__section-header">Master Object Details</h1>
          <Select
            label="Library"
            labelDescription="This is the library where your master object will be created."
            formName="masterLibrary"
            required={true}
            options={
              Object.keys(ingestStore.libraries || {}).map(libraryId => (
                {
                  label: ingestStore.libraries[libraryId].name || "",
                  value: libraryId
                }
              ))
            }
            defaultOption={{
              value: "",
              label: "Select library"
            }}
            onChange={event => setMasterLibrary(event.target.value)}
          />

          {
            LibraryAbrInput({
              onChange: event => setMasterAbr(event.target.value),
              library: masterLibrary,
              value: masterAbr,
              required: true
            })
          }

          <Select
            label="AccessGroup"
            labelDescription="This is the Access Group you want to manage your master object."
            formName="masterGroup"
            required={false}
            options={
              Object.keys(ingestStore.accessGroups || {}).map(accessGroupName => (
                {
                  label: accessGroupName,
                  value: accessGroupName
                }
              ))
            }
            defaultOption={{
              value: "",
              label: "Select Access Group"
            }}
            onChange={event => setMasterGroup(event.target.value)}
          />

          <Input
            label="Name"
            required={true}
            formName="masterName"
            onChange={event => setMasterName(event.target.value)}
            value={masterName}
          />
          <Input
            label="Description"
            formName="masterDescription"
            onChange={event => setMasterDescription(event.target.value)}
            value={masterDescription}
          />

          <Select
            label="Playback Encryption"
            labelDescription="Select a playback encryption option. Enable Clear and/or Digital Rights Management copy protection during playback."
            formName="playbackEncryption"
            required={true}
            options={[
              {value: "drm", label: "Digital Rights Management", disabled: disableDrm},
              {value: "clear", label: "Clear", disabled: disableClear},
              {value: "both", label: "Both", disabled: disableDrm || disableClear},
            ]}
            defaultOption={{
              value: "",
              label: "Select encryption"
            }}
            value={playbackEncryption}
            onChange={event => setPlaybackEncryption(event.target.value)}
          />

          <Checkbox
            label="Use master object as mezzanine object"
            value={useMasterAsMez}
            checked={useMasterAsMez}
            onChange={event => setUseMasterAsMez(event.target.checked)}
          />

          { !useMasterAsMez && mezDetails }

          <div>
            <input
              className="form__actions"
              type="submit"
              value={isCreating ? "Submitting..." : "Create"}
              disabled={isCreating}
            />
          </div>
        </form>
      </div>
    </FabricLoader>
  );
});

export default Form;
