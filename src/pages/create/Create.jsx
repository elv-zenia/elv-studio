import {useEffect, useRef, useState} from "react";
import {Navigate} from "react-router-dom";
import {observer} from "mobx-react-lite";
import PrettyBytes from "pretty-bytes";

import {ingestStore, tenantStore, rootStore} from "@/stores";
import {s3Regions} from "@/utils";
import {abrProfileClear, abrProfileBoth} from "@/utils/ABR";
import {CloseIcon} from "@/assets/icons";

import PageContainer from "@/components/page-container/PageContainer.jsx";
import Dropzone from "@/components/common/Dropzone";
import FabricLoader from "@/components/FabricLoader";
import InlineNotification from "@/components/common/InlineNotification";
import AdvancedSection from "@/pages/create/advanced-section/AdvancedSection.jsx";

import {
  Box,
  Radio,
  Select,
  Stack,
  TextInput,
  Checkbox,
  Textarea,
  Button
} from "@mantine/core";
import AdvancedSelect from "@/components/advanced-select/AdvancedSelect.jsx";
import FormSectionTitle from "@/components/form-section-title/FormSectionTitle.jsx";

const ErrorMessaging = ({errorTitle, errorMessage}) => {
  const errorRef = useRef(null);

  useEffect(() => {
    if(errorRef && errorRef.current) {
      errorRef.current.scrollIntoView();
    }
  }, [errorTitle]);

  if(!errorTitle && !errorMessage) { return null; }

  return (
    <div className="form-notification" ref={errorRef}>
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

const Permissions = ({permission, setPermission}) => {
  const permissionLevels = rootStore.client.permissionLevels;

  return (
    <Box mb={16}>
      <Select
        label="Permission"
        description="Set a permission level."
        tooltip={
          Object.values(rootStore.client.permissionLevels).map(({short, description}) =>
            <div key={`permission-info-${short}`} className="form__permission-tooltip-item">
              <div className="form__permission-tooltip-title">{ short }:</div>
              <div>{ description }</div>
            </div>
          )
        }
        value={permission}
        onChange={value => setPermission(value)}
        data={
          Object.keys(permissionLevels || []).map(permissionName => (
            {
              label: permissionLevels[permissionName].short,
              value: permissionName
            }
          ))
        }
        mt={16}
      />
    </Box>
  );
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

const Create = observer(() => {
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [masterObjectId, setMasterObjectId] = useState();
  const [uploadMethod, setUploadMethod] = useState("LOCAL");
  const [files, setFiles] = useState([]);
  const [abrProfile, setAbrProfile] = useState();
  const [masterLibrary, setMasterLibrary] = useState();
  const [accessGroup, setAccessGroup] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [permission, setPermission] = useState("editable");

  const [mezLibrary, setMezLibrary] = useState();
  const [mezContentType, setMezContentType] = useState("");

  const [displayTitle, setDisplayTitle] = useState();
  const [playbackEncryption, setPlaybackEncryption] = useState("");
  const [useMasterAsMez, setUseMasterAsMez] = useState(true);

  const [hasDrmCert, setHasDrmCert] = useState(false);
  const [disableDrmAll, setDisableDrmAll] = useState(true);
  const [disableDrmPublic, setDisableDrmPublic] = useState(true);
  const [disableDrmRestricted, setDisableDrmRestricted] = useState(true);
  const [disableClear, setDisableClear] = useState(true);

  const [s3Url, setS3Url] = useState();
  const [s3Region, setS3Region] = useState();
  const [s3AccessKey, setS3AccessKey] = useState();
  const [s3Secret, setS3Secret] = useState();
  const [s3Copy, setS3Copy] = useState(false);
  const [s3PresignedUrl, setS3PresignedUrl] = useState();
  const [s3UseAKSecret, setS3UseAKSecret] = useState(false);

  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false);

  const ENCRYPTION_OPTIONS = [
    {value: "drm-public", label: "DRM - Public Access", disabled: disableDrmPublic, description: "Playout Formats: Dash Widevine, HLS Sample AES, HLS AES-128"},
    {value: "drm-all", label: "DRM - All Formats", disabled: disableDrmAll, description: "Playout Formats: Dash Widevine, HLS Sample AES, HLS AES-128, HLS Fairplay, HLS Widevine, HLS PlayReady"},
    {value: "drm-restricted", label: "DRM - Widevine and Fairplay", disabled: disableDrmRestricted, description: "Playout Formats: Dash Widevine, HLS Fairplay"},
    {value: "clear", label: "Clear", disabled: disableClear},
    {value: "custom", label: "Custom"}
  ];

  useEffect(() => {
    if(tenantStore.loaded) {
      if(tenantStore.titleContentType) {
        setMezContentType(tenantStore.titleContentType);
      } else {
        const defaultType = Object.keys(ingestStore.contentTypes || {})
          .find(id => {
            if(
              ingestStore.contentTypes[id] &&
              ingestStore.contentTypes[id].name.toLowerCase().includes("title")
            ) {
              return id;
            }
          });

        if(defaultType) {
          setMezContentType(defaultType);
        }
      }
    }
  }, [ingestStore.contentTypes, tenantStore.loaded, tenantStore.titleContentType]);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(masterLibrary)) { return; }

    SetPlaybackSettings({
      libraryId: masterLibrary,
      type: "MASTER"
    });
  }, [masterLibrary]);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(mezLibrary)) { return; }

    SetPlaybackSettings({
      libraryId: mezLibrary,
      type: "MEZ"
    });
  }, [mezLibrary]);

  useEffect(() => {
    if(permission === "owner") {
      setDisableDrmAll(true);
      setDisableDrmPublic(true);
      setDisableDrmRestricted(true);
    } else {
      if(
        !ingestStore.libraries ||
        (!ingestStore.GetLibrary(mezLibrary) &&
        !ingestStore.GetLibrary(masterLibrary))
      ) {
        return;
      }

      SetPlaybackSettings({
        libraryId: mezLibrary || masterLibrary,
        type: mezLibrary ? "MEZ" : "MASTER"
      });
    }
  }, [permission]);

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
      SetAbrProfile({
        profile: {default_profile: hasDrmCert ? abrProfileBoth : abrProfileClear},
        stringify: true
      });
    }
  }, [playbackEncryption]);

  const mezDetails = (
    <>
      <Select
        label="Mezzanine Library"
        description="This is the library where your mezzanine object will be created."
        name="mezLibrary"
        required={true}
        data={
          Object.keys(ingestStore.libraries || {}).map(libraryId => (
            {
              label: ingestStore.libraries[libraryId].name || "",
              value: libraryId
            }
          ))
        }
        placeholder="Select Library"
        onChange={value => setMezLibrary(value)}
        value={mezLibrary}
        mb={16}
      />
    </>
  );

  const SetAbrProfile = ({profile, stringify=true}) => {
    const abr = stringify ? JSON.stringify(profile, null, 2) || "" : profile;
    setAbrProfile(abr);
  };

  const SetMezContentType = async ({type}) => {
    let contentType;

    if(!type) {
      contentType = mezContentType || "";
    } else if(type.startsWith("iq__")) {
      contentType = type;
    } else if(type.startsWith("hq__")) {
      contentType = (await ingestStore.ContentType({versionHash: type})).id || "";
    } else if(type.length > 0) {
      contentType = (await ingestStore.ContentType(({name: type}))).id || "";
    }

    setMezContentType(contentType);
  };

  const SetPlaybackSettings = ({
    libraryId,
    type
  }) => {
    const library = ingestStore.GetLibrary(libraryId);
    const libraryHasCert = !!library.drmCert;
    setHasDrmCert(libraryHasCert);

    if(type === "MASTER" && useMasterAsMez || type === "MEZ") {
      const profile = library.abr && library.abr.default_profile;

      SetMezContentType({
        type: library.abr && library.abr.mez_content_type || ""
      });

      if(!profile || Object.keys(profile).length === 0) {
        SetAbrProfile({
          profile: {default_profile: libraryHasCert ? abrProfileBoth : abrProfileClear},
          stringify: true
        });

        setDisableDrmAll(!libraryHasCert || permission === "owner");
        setDisableDrmPublic(!libraryHasCert || permission === "owner");
        setDisableDrmRestricted(!libraryHasCert || permission === "owner");
        setDisableClear(false);
      } else {
        SetAbrProfile({profile: library.abr, stringify: true});

        setDisableClear(!library.abrProfileSupport.clear);
        setDisableDrmAll(!libraryHasCert || !library.abrProfileSupport.drmAll || permission === "owner");
        setDisableDrmPublic(!libraryHasCert || !library.abrProfileSupport.drmPublic || permission === "owner");
        setDisableDrmRestricted(!libraryHasCert || !library.abrProfileSupport.drmRestricted || permission === "owner");
      }

      setPlaybackEncryption("");
    }
  };

  const ValidForm = () => {
    if(
      uploadMethod === "LOCAL" && files.length === 0 ||
      !masterLibrary ||
      !name ||
      !playbackEncryption ||
      playbackEncryption === "custom" && !abrProfile ||
      errorMessage ||
      errorTitle ||
      !mezContentType
    ) {
      return false;
    }

    if(uploadMethod === "S3") {
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
      if(uploadMethod === "S3") {
        access = S3Access({
          s3UseAKSecret,
          s3Url,
          s3AccessKey,
          s3Secret,
          s3PresignedUrl,
          s3Region
        });
      }

      let accessGroupAddress = ingestStore.accessGroups[accessGroup] ? ingestStore.accessGroups[accessGroup].address : undefined;

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
            accessGroup: accessGroupAddress,
            files: uploadMethod === "LOCAL" ? files : undefined,
            title: name,
            description: description,
            s3Url: uploadMethod === "S3" ? s3Url : undefined,
            playbackEncryption,
            access: JSON.stringify(access, null, 2) || "",
            copy: s3Copy,
            abr: abrMetadata
          },
          mez: {
            libraryId: useMasterAsMez ? masterLibrary : mezLibrary,
            accessGroup: accessGroupAddress,
            name: name,
            description: description,
            displayTitle,
            newObject: !useMasterAsMez,
            permission: permission
          }
        }
      };

      const createResponse = await ingestStore.CreateContentObject(createParams) || {};

      if(createResponse.error) {
        setErrorTitle("Unable to create content object");
        setErrorMessage(createResponse.error);
      } else if(createResponse.id) {
        setMasterObjectId(createResponse.id);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if(masterObjectId) {
    return <Navigate to={`/jobs/${masterObjectId}`} replace />;
  }

  return (
    <PageContainer title="Ingest New Video on Demand">
      <FabricLoader>
        <ErrorMessaging errorMessage={errorMessage} errorTitle={errorTitle} />

        <form onSubmit={HandleSubmit}>
          <Radio.Group
            label="Upload Method"
            name="uploadMethod"
            value={uploadMethod}
            onChange={value => setUploadMethod(value)}
            mb={16}
          >
            <Stack mt="xs">
              <Radio value="LOCAL" label="Local File" />
              <Radio value="S3" label="S3 Bucket" />
            </Stack>
          </Radio.Group>
          {
            uploadMethod === "LOCAL" &&
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
                          <CloseIcon />
                          {/*<ImageIcon className="file-list__item__close-button__icon" icon={CloseIcon} />*/}
                        </button>
                      </div>
                    ))
                  }
                </div>
              </>
          }

          {/* S3 Details */}
          {
            uploadMethod === "S3" && <>
              {
                !s3UseAKSecret &&
                <Textarea
                  label="Presigned URL"
                  name="presignedUrl"
                  value={s3PresignedUrl}
                  onChange={event => setS3PresignedUrl(event.target.value)}
                  required={uploadMethod === "S3" && !s3UseAKSecret}
                  mb={16}
                />
              }

              <Select
                label="Region"
                name="s3Region"
                data={
                  s3Regions.map(({value, name}) => (
                    {value, label: name}
                  ))
                }
                placeholder="Select Region"
                onChange={value => setS3Region(value)}
                required={s3UseAKSecret}
                mb={16}
              />

              <Checkbox
                label="Use access key and secret"
                name="s3UseAKSecret"
                checked={s3UseAKSecret}
                onChange={event => setS3UseAKSecret(event.target.checked)}
                mb={16}
              />

              {
                s3UseAKSecret &&
                  <>
                    <TextInput
                      label="S3 URI"
                      name="s3Url"
                      value={s3Url}
                      onChange={event => setS3Url(event.target.value)}
                      placeholder="s3://BUCKET_NAME/PATH_TO_MEDIA.mp4"
                      required={uploadMethod === "S3"}
                      mb={16}
                    />
                    <TextInput
                      label="Access key"
                      name="s3AccessKey"
                      value={s3AccessKey}
                      onChange={event => setS3AccessKey(event.target.value)}
                      type="password"
                      required={uploadMethod === "S3"}
                      mb={16}
                    />

                    <TextInput
                      label="Secret"
                      name="s3Secret"
                      value={s3Secret}
                      onChange={event => setS3Secret(event.target.value)}
                      type="password"
                      required={uploadMethod === "S3"}
                      mb={16}
                    />
                  </>
              }

              <Checkbox
                label="Copy file onto the fabric"
                name="s3Copy"
                checked={s3Copy}
                onChange={event => setS3Copy(event.target.checked)}
                mb={16}
              />
            </>
          }

          <FormSectionTitle
            title="Details"
          />

          <TextInput
            label="Name"
            name="name"
            onChange={event => setName(event.target.value)}
            value={name}
            mb={16}
            required
          />
          <TextInput
            label="Description"
            name="description"
            onChange={event => setDescription(event.target.value)}
            value={description}
            mb={16}
          />
          <TextInput
            label="Display Title"
            name="displayTitle"
            onChange={event => setDisplayTitle(event.target.value)}
            value={displayTitle}
            mb={16}
          />

          <Select
            label="Access Group"
            description="This is the Access Group that will manage your master object."
            name="accessGroup"
            data={
              Object.keys(ingestStore.accessGroups || {}).map(groupName => (
                {value: groupName, label: groupName}
              ))
            }
            placeholder="Select Access Group"
            value={accessGroup}
            onChange={(value) => setAccessGroup(value)}
            allowDeselect={false}
            mb={16}
          />

          <Checkbox
            label="Use Master Object as Mezzanine Object"
            checked={useMasterAsMez}
            onChange={event => {
              setMezLibrary(masterLibrary);
              setUseMasterAsMez(event.target.checked);
            }}
            name="masterAsMez"
            mb={16}
          />

          <Select
            label="Library"
            description={useMasterAsMez ? "This is the library where your master and mezzanine object will be created." : "This is the library where your master object will be created."}
            name="masterLibrary"
            required={true}
            data={
              Object.keys(ingestStore.libraries || {}).map(libraryId => (
                {
                  label: ingestStore.libraries[libraryId].name || "",
                  value: libraryId
                }
              ))
            }
            placeholder="Select Library"
            onChange={value => setMasterLibrary(value)}
            mb={16}
          />

          { !useMasterAsMez && mezDetails }

          <FormSectionTitle
            title="Playback Settings"
          />

          <AdvancedSelect
            value={playbackEncryption}
            SetValue={setPlaybackEncryption}
            options={ENCRYPTION_OPTIONS}
          />

          {
            playbackEncryption === "custom" &&
            <Textarea
              name="abrProfile"
              label="ABR Profile Metadata"
              value={abrProfile}
              onChange={event => setAbrProfile(event.target.value)}
              required={playbackEncryption === "custom"}
              defaultValue={{default_profile: {}}}
              minRows={6}
              maxRows={10}
              autosize
              mb={16}
            />
          }

          <AdvancedSection
            useAdvancedSettings={useAdvancedSettings}
            setUseAdvancedSettings={setUseAdvancedSettings}
          >
            <Permissions permission={permission} setPermission={setPermission} />

            <Box mb={16}>
              <Select
                label="Mezzanine Content Type"
                description="This will determine the type for the mezzanine object creation. Enter a valid object ID, version hash, or title."
                name="mezContentType"
                required={true}
                data={Object.keys(ingestStore.contentTypes || {}).map(typeId => (
                  {value: typeId, label: ingestStore.contentTypes[typeId].name}
                ))}
                placeholder="Select Content Type"
                value={mezContentType}
                onChange={event => setMezContentType(event.target.value)}
              />
            </Box>
          </AdvancedSection>

          <Button
            type="submit"
            disabled={isCreating || !ValidForm()}
            mt={16}
          >
            { isCreating ? "Submitting..." : "Create" }
          </Button>
        </form>
      </FabricLoader>
    </PageContainer>
  );
});

export default Create;
