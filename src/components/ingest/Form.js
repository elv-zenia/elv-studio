import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import Dropzone from "Components/common/Dropzone";
import LibraryWrapper from "Components/LibraryWrapper";
import {Input, TextArea, Select, JsonTextArea, Checkbox} from "Components/common/Inputs";

const Form = observer(() => {
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
  const [s3Url, setS3Url] = useState();
  const [playbackEncryption, setPlaybackEncryption] = useState();
  const [useMasterAsMez, setUseMasterAsMez] = useState(true);

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
      files,
      title: masterName,
      description: masterDescription,
      CreateCallback: id => {
        console.log("create - id", id);
      }
    });

    console.log("master response", response);

    console.log("mez args", {
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

    const mezResponse = await ingestStore.CreateABRMezzanine({
      libraryId: useMasterAsMez ? masterLibrary : mezLibrary,
      masterObjectId: useMasterAsMez ? response.id : undefined,
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
          <label className="form__input-label">Upload</label>
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

          <Input
            label="Or upload from an S3 URL"
            formName="s3Url" value={s3Url}
            onChange={event => setS3Url(event.target.value)}
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
