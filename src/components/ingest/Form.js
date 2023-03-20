import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import Dropzone from "Components/common/Dropzone";
import FabricLoader from "Components/FabricLoader";
import {Input, TextArea, Select, JsonTextArea, Checkbox, Radio} from "Components/common/Inputs";
import {Redirect} from "react-router-dom";
import {s3Regions} from "Utils";
import PrettyBytes from "pretty-bytes";
import InlineNotification from "Components/common/InlineNotification";
import ImageIcon from "Components/common/ImageIcon";
import CloseIcon from "Assets/icons/close";
import {abrProfileDrm} from "Utils/ABR";

const ErrorMessaging = ({errorTitle, errorMessage}) => {
  if(!errorTitle && !errorMessage) { return null; }

  return (
    <div className="form-notification">
      <InlineNotification
        type="error"
        title={errorTitle}
        message={errorMessage}
      />
    </div>
  );
};

const HandleRemove = ({index, files, SetFilesCallback}) => {
  const newFiles = files
    .slice(0, index)
    .concat(files.slice(index + 1));

  if(SetFilesCallback && typeof SetFilesCallback === "function") {
    SetFilesCallback(newFiles);
  }
};

const S3Access = ({
  s3UseAKSecret,
  s3Url,
  s3AccessKey,
  s3Secret,
  s3PresignedUrl,
  s3Region
}) => {
  let cloudCredentials;
  let bucket;
  if(s3UseAKSecret && s3Url) {
    const s3PrefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified
    const s3PrefixMatch = (s3PrefixRegex.exec(s3Url));

    bucket = s3PrefixMatch[1];
    cloudCredentials = {
      access_key_id: s3AccessKey,
      secret_access_key: s3Secret
    };
  } else if(s3PresignedUrl) {
    const httpsPrefixRegex = /^https:\/\/([^/]+)\//i;
    const httpsPrefixMatch = (httpsPrefixRegex.exec(s3PresignedUrl));
    bucket = httpsPrefixMatch[1].split(".")[0];

    cloudCredentials = {
      signed_url: s3PresignedUrl
    };
  }

  return [{
    path_matchers: [".*"],
    remote_access: {
      protocol: "s3",
      platform: "aws",
      path: `${bucket}/`,
      storage_endpoint: {
        region: s3Region
      },
      cloud_credentials: cloudCredentials
    }
  }];
};

const SetPlaybackSettings = ({
  library,
  type,
  useMasterAsMez,
  DisableDrmCallback,
  SetMezContentTypeCallback,
  SetAbrProfileCallback
}) => {
  const hasDrmCert = library.drmCert;
  DisableDrmCallback(!hasDrmCert);

  if(type === "MASTER" && useMasterAsMez || type === "MEZ") {
    const abr = JSON.stringify(library.abr, null, 2) || "";
    SetAbrProfileCallback(abr);
    const profile = library.abr && library.abr.default_profile;
    const mezContentType = library.abr && library.abr.mez_content_type;

    SetMezContentTypeCallback(mezContentType);

    if(!profile || Object.keys(profile).length === 0) {
      SetAbrProfileCallback(JSON.stringify({default_profile: abrProfileDrm}, null, 2));
    }
  }
};

const Form = observer(() => {
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("message");
  const [errorTitle, setErrorTitle] = useState("title");
  const [masterObjectId, setMasterObjectId] = useState();
  const [uploadMethod, setUploadMethod] = useState("local");
  const [files, setFiles] = useState([]);
  const [abrProfile, setAbrProfile] = useState();
  const [masterLibrary, setMasterLibrary] = useState();
  const [masterGroup, setMasterGroup] = useState();
  const [masterName, setMasterName] = useState();

  const [mezLibrary, setMezLibrary] = useState();
  const [mezGroup, setMezGroup] = useState();
  const [masterDescription, setMasterDescription] = useState();
  const [mezName, setMezName] = useState();
  const [mezDescription, setMezDescription] = useState();
  const [mezContentType, setMezContentType] = useState();

  const [displayName, setDisplayName] = useState();
  const [playbackEncryption, setPlaybackEncryption] = useState("");
  const [useMasterAsMez, setUseMasterAsMez] = useState(true);
  const [disableDrm, setDisableDrm] = useState(false);

  const [s3Url, setS3Url] = useState();
  const [s3Region, setS3Region] = useState();
  const [s3AccessKey, setS3AccessKey] = useState();
  const [s3Secret, setS3Secret] = useState();
  const [s3Copy, setS3Copy] = useState(false);
  const [s3PresignedUrl, setS3PresignedUrl] = useState();
  const [s3UseAKSecret, setS3UseAKSecret] = useState(false);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(masterLibrary)) { return; }

    SetPlaybackSettings({
      library: ingestStore.GetLibrary(masterLibrary),
      type: "MASTER",
      useMasterAsMez,
      DisableDrmCallback: setDisableDrm,
      SetMezContentTypeCallback: setMezContentType,
      SetAbrProfileCallback: setAbrProfile
    });
  }, [masterLibrary]);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(mezLibrary)) { return; }

    SetPlaybackSettings({
      library: ingestStore.GetLibrary(mezLibrary),
      type: "MEZ",
      useMasterAsMez,
      DisableDrmCallback: setDisableDrm,
      SetMezContentTypeCallback: setMezContentType,
      SetAbrProfileCallback: setAbrProfile
    });
  }, [mezLibrary]);

  useEffect(() => {
    const hasSizeableFiles = files.some(file => file.size > 0);

    if(!hasSizeableFiles && files.length > 0) {
      setErrorTitle(`Empty ${files.length === 1 ? "File" : "Files"}.`);
      setErrorMessage(`${files.length === 1 ? "This file contains" : "These files contain"} no data.`);
    } else {
      setErrorTitle("");
      setErrorMessage("");
    }
  }, [files]);

  useEffect(() => {
    if(playbackEncryption === "custom" && !abrProfile) {
      const profile = JSON.stringify({default_profile: abrProfileDrm}, null, 2);
      setAbrProfile(profile);
    }
  }, [playbackEncryption]);

  const mezDetails = (
    <>
      <h1 className="form__section-header">Mezzanine Object Details</h1>
      <Input
        label="Name"
        formName="mezName"
        onChange={event => setMezName(event.target.value)}
        value={mezName}
      />
      <Input
        label="Description"
        formName="mezDescription"
        onChange={event => setMezDescription(event.target.value)}
        value={mezDescription}
      />

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
          label: "Select Library"
        }}
        onChange={event => setMezLibrary(event.target.value)}
        value={mezLibrary}
      />

      <Select
        label="Access Group"
        labelDescription="This is the Access Group that will manage your mezzanine object."
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
    </>
  );

  const ValidForm = () => {
    if(
      uploadMethod === "local" && files.length === 0 ||
      !masterLibrary ||
      !masterName ||
      !playbackEncryption ||
      playbackEncryption === "custom" && !abrProfile ||
      errorMessage ||
      errorTitle ||
      !mezContentType
    ) {
      return false;
    }

    if(uploadMethod === "s3") {
      if(s3UseAKSecret) {
        if(
          !s3Region ||
          !s3Url ||
          !s3AccessKey ||
          !s3Secret
        ) {
          return false;
        }
      } else {
        if(!s3PresignedUrl) {
          return false;
        }
      }
    }

    return true;
  };

  const HandleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    let access = [];
    try {
      if(uploadMethod === "s3") {
        access = S3Access({
          s3UseAKSecret,
          s3Url,
          s3AccessKey,
          s3Secret,
          s3PresignedUrl,
          s3Region
        });
      }

      let accessGroup = ingestStore.accessGroups[masterGroup] ? ingestStore.accessGroups[masterGroup].address : undefined;
      let mezAccessGroupAddress = useMasterAsMez? accessGroup : ingestStore.accessGroups[mezGroup] ? ingestStore.accessGroups[mezGroup].address : undefined;

      let abrMetadata;
      let type;
      if(playbackEncryption === "custom") {
        abrMetadata = JSON.stringify({
          ...JSON.parse(abrProfile),
          mez_content_type: mezContentType
        }, null, 2);

        type = JSON.parse(abrMetadata).mez_content_type;
      } else {
        abrMetadata = abrProfile;
        type = mezContentType;
      }

      let createParams = {
        libraryId: masterLibrary,
        mezContentType: type,
        formData: {
          master: {
            libraryId: masterLibrary,
            accessGroup,
            files: uploadMethod === "local" ? files : undefined,
            title: masterName,
            description: masterDescription,
            s3Url: uploadMethod === "s3" ? s3Url : undefined,
            playbackEncryption,
            access: JSON.stringify(access, null, 2) || "",
            copy: s3Copy,
            abr: abrMetadata
          },
          mez: {
            libraryId: useMasterAsMez ? masterLibrary : mezLibrary,
            accessGroup: mezAccessGroupAddress,
            name: mezName || masterName,
            description: useMasterAsMez ? masterDescription : mezDescription,
            displayName,
            newObject: !useMasterAsMez
          }
        }
      };

      const createResponse = await ingestStore.CreateContentObject(createParams);

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

        <ErrorMessaging errorMessage={errorMessage} errorTitle={errorTitle} />

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
                <Dropzone
                  accept={{"audio/*": [], "video/*": []}}
                  id="main-dropzone"
                  onDrop={files => setFiles(files)}
                />
                <label>Files:</label>
                <div className="file-list">
                  {
                    files.map((file, index) => (
                      <div className="file-list__item" key={`${file.name || file.path}-${index}`}>
                        <span>{file.name || file.path}</span>
                        <span>&nbsp;- {PrettyBytes(file.size || 0)}</span>
                        <button
                          type="button"
                          title="Remove file"
                          aria-label="Remove file"
                          onClick={() => HandleRemove({index, files, SetFilesCallback: setFiles})}
                          className="file-list__item__close-button"
                        >
                          <ImageIcon className="file-list__item__close-button__icon" icon={CloseIcon} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </>
          }

          {/* S3 Details */}
          {
            uploadMethod === "s3" && <>
              {
                !s3UseAKSecret &&
                <TextArea
                  label="Presigned URL"
                  value={s3PresignedUrl}
                  onChange={event => setS3PresignedUrl(event.target.value)}
                  required={uploadMethod === "s3" && !s3UseAKSecret}
                />
              }

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
                  label: "Select Region"
                }}
                onChange={event => setS3Region(event.target.value)}
                required={s3UseAKSecret}
              />

              <Checkbox
                label="Use access key and secret"
                value={s3UseAKSecret}
                checked={s3UseAKSecret}
                onChange={event => setS3UseAKSecret(event.target.checked)}
              />

              {
                s3UseAKSecret &&
                  <>
                    <Input
                      label="S3 URI"
                      formName="s3Url"
                      value={s3Url}
                      onChange={event => setS3Url(event.target.value)}
                      placeholder="s3://BUCKET_NAME/PATH_TO_MEDIA.mp4"
                      required={uploadMethod === "s3"}
                    />
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
          <Input
            label="Display Name"
            formName="displayName"
            onChange={event => setDisplayName(event.target.value)}
            value={displayName}
          />

          <Select
            label="Access Group"
            labelDescription="This is the Access Group that will manage your master object."
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
              label: "Select Library"
            }}
            onChange={event => setMasterLibrary(event.target.value)}
          />

          <Checkbox
            label="Use Master Object as Mezzanine Object"
            value={useMasterAsMez}
            checked={useMasterAsMez}
            onChange={event => {
              setMezName(masterName);
              setMezDescription(masterDescription);
              setMezLibrary(masterLibrary);
              setUseMasterAsMez(event.target.checked);
            }}
          />

          { !useMasterAsMez && mezDetails }

          <h1 className="form__section-header">Playback Settings</h1>
          <Select
            label="Playback Encryption"
            labelDescription="Select a playback encryption option. Enable Clear or Digital Rights Management (DRM) copy protection during playback. To configure the ABR profile entirely, use the Custom option."
            formName="playbackEncryption"
            required={true}
            options={[
              {value: "drm-public", label: "DRM - Public Access", disabled: disableDrm},
              {value: "drm", label: "DRM - All Formats", disabled: disableDrm},
              {value: "drm-restricted", label: "DRM - Widevine and Fairplay", disabled: disableDrm},
              {value: "clear", label: "Clear"},
              {value: "custom", label: "Custom"}
            ]}
            defaultOption={{
              value: "",
              label: "Select Encryption"
            }}
            value={playbackEncryption}
            onChange={event => setPlaybackEncryption(event.target.value)}
          />

          {
            playbackEncryption === "custom" &&
            <JsonTextArea
              formName="abrProfile"
              label="ABR Profile Metadata"
              value={abrProfile}
              onChange={event => setAbrProfile(event.target.value)}
              required={playbackEncryption === "custom"}
              defaultValue={{default_profile: {}}}
            />
          }

          <Input
            label="Mezzanine Content Type"
            labelDescription="This will determine the type for the mezzanine object creation. Enter a valid object ID, version hash, or title."
            value={mezContentType}
            onChange={event => setMezContentType(event.target.value)}
            required={true}
          />

          <div>
            <input
              className="form__actions"
              type="submit"
              value={isCreating ? "Submitting..." : "Create"}
              disabled={isCreating || !ValidForm()}
            />
          </div>
        </form>
      </div>
    </FabricLoader>
  );
});

export default Form;
