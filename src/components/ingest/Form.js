import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import Dropzone from "Components/common/Dropzone";
import LibraryWrapper from "Components/LibraryWrapper";
import {Input, TextArea, Select, JsonTextArea, Checkbox, Radio} from "Components/common/Inputs";

const Form = observer(() => {
  const [uploadMethod, setUploadMethod] = useState("local");
  const [files, setFiles] = useState([]);
  const [masterAbr, setMasterAbr] = useState();
  const [masterLibrary, setMasterLibrary] = useState();
  const [masterName, setMasterName] = useState();

  const [mezLibrary, setMezLibrary] = useState();
  const [masterDescription, setMasterDescription] = useState();
  const [mezName, setMezName] = useState();
  const [mezDescription, setMezDescription] = useState();
  const [mezAbr, setMezAbr] = useState();

  const [displayName, setDisplayName] = useState();
  const [playbackEncryption, setPlaybackEncryption] = useState();
  const [useMasterAsMez, setUseMasterAsMez] = useState(true);

  const [s3Url, setS3Url] = useState();
  const [s3Region, setS3Region] = useState();
  const [s3AccessKey, setS3AccessKey] = useState();
  const [s3Secret, setS3Secret] = useState();
  const [s3Copy, setS3Copy] = useState(false);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(masterLibrary)) { return; }

    const abr = JSON.stringify(
      ingestStore.GetLibrary(masterLibrary).abr, null, 2
    ) || "";

    setMasterAbr(abr);
  }, [masterLibrary]);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(mezLibrary)) { return; }

    const abr = JSON.stringify(
      ingestStore.GetLibrary(mezLibrary).abr, null, 2
    ) || "";

    setMezAbr(abr);
  }, [mezLibrary]);

  const HandleSubmit = async (event) => {
    event.preventDefault();

    const response = await ingestStore.CreateProductionMaster({
      libraryId: masterLibrary,
      abr: masterAbr,
      files: uploadMethod === "local" ? files : undefined,
      title: masterName,
      description: masterDescription,
      CreateCallback: id => {
        console.log("create - id", id);
      },
      s3Url: uploadMethod === "s3" ? s3Url : undefined,
      s3Access: uploadMethod === "s3" ? {
        region: s3Region,
        accessKey: s3AccessKey,
        secret: s3Secret,
        copy: s3Copy
      } : undefined
    });

    console.log("master response", response);

    const mezResponse = await ingestStore.CreateABRMezzanine({
      libraryId: useMasterAsMez ? masterLibrary : mezLibrary,
      masterObjectId: response.id,
      masterVersionHash: response.hash,
      abrProfile: response.abrProfile,
      type: response.contentTypeId,
      name: useMasterAsMez ? masterName : mezName,
      description: useMasterAsMez ? masterDescription : mezDescription,
      displayName,
      newObject: true
    });
    console.log("mez response", mezResponse);
  };

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

      {
        LibraryAbrInput({
          onChange: event => setMezAbr(event.target.value),
          library: mezLibrary,
          value: mezAbr
        })
      }

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
      <TextArea
        label="Description"
        formName="mezDescription"
        onChange={event => setMezDescription(event.target.value)}
        value={mezDescription}
      />
    </>
  );

  return (
    <LibraryWrapper>
      <div className="page-container">
        <div className="page__header">Ingest New Media</div>
        <form className="form" onSubmit={HandleSubmit}>
          <Radio
            label="Upload Method:"
            required={true}
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
                optionLabel: "S3 URI",
                id: "s3",
                value: "s3",
                checked: uploadMethod === "s3",
                onChange: event => setUploadMethod(event.target.value)
              }
            ]}
          />

          {
            Dropzone({
              accept: {"audio/*": [], "video/*": []},
              id: "main-dropzone",
              onDrop: files => setFiles(files)
            })
          }

          <label>{ files.length === 1 ? "File:" : "Files:" }</label>
          <div className="file-names">
            {
              files.map((file, index) => (
                <div key={`${file.name || file.path}-${index}`}>{file.name || file.path}</div>
              ))
            }
          </div>

          {/* S3 Details */}
          <Input
            label="Or upload from an S3 URL"
            formName="s3Url"
            value={s3Url}
            onChange={event => setS3Url(event.target.value)}
            placeholder="s3://BUCKET_NAME/video.mp4"
          />
          <Input
            label="Region"
            formName="s3Region"
            value={s3Region}
            onChange={event => setS3Region(event.target.value)}
          />
          <Input
            label="Access key"
            formName="s3AccessKey"
            value={s3AccessKey}
            onChange={event => setS3AccessKey(event.target.value)}
            type="password"
          />
          <Input
            label="Secret"
            formName="s3Secret"
            value={s3Secret}
            onChange={event => setS3Secret(event.target.value)}
            type="password"
          />
          <Checkbox
            label="Copy file onto the fabric"
            value={s3Copy}
            checked={s3Copy}
            onChange={event => setS3Copy(event.target.value)}
          />

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

          <Input
            label="Name"
            required={true}
            formName="masterName"
            onChange={event => setMasterName(event.target.value)}
            value={masterName}
          />
          <TextArea
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
              {value: "drm", label: "Digital Rights Management"},
              {value: "clear", label: "Clear"},
              {value: "both", label: "Both"},
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
              value="Create"
            />
          </div>
        </form>
      </div>
    </LibraryWrapper>
  );
});

export default Form;
