import React, {useState} from "react";
import {observer} from "mobx-react";

import {ingestStore} from "Stores";
import Dropzone from "Components/common/Dropzone";
import LibraryWrapper from "Components/LibraryWrapper";
import Input from "Components/common/Input";
import TextArea from "Components/common/TextArea";
import Select from "Components/common/Select";

const Form = observer(() => {
  const [files, setFiles] = useState();

  const HandleSubmit = (event) => {
    event.preventDefault();
    console.log("event", event.target.library.value);
    console.log("event", event.target.elements);
    console.log(files);
  };

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
              OnDrop: files => setFiles(files)
            })
          }

          <Input label="Upload from S3 URL" formName="s3Url" />

          <h1 className="form__section-header">Master Object Details</h1>

          <Select
            label="Library"
            labelDescription="This is the library where your master object will be created."
            formName="library"
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
          />

          <Input label="Name" required={true} formName="name" />
          <Input label="Display Name" formName="displayName" />
          <TextArea label="Description" formName="description" />

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
          />

          <input type="submit" value="Create" />
        </form>
      </div>
    </LibraryWrapper>
  );
});

export default Form;
