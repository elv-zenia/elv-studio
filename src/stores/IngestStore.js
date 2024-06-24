import {flow, makeAutoObservable} from "mobx";
import {ValidateLibrary, ValidateWriteToken} from "@eluvio/elv-client-js/src/Validation";
import UrlJoin from "url-join";
import {FileInfo} from "Utils/Files";
import Path from "path";
import {DrmPublicProfile, DrmWidevineFairplayProfile} from "Utils/ABR";
const ABR = require("@eluvio/elv-abr-profile");
const defaultOptions = require("@eluvio/elv-lro-status/defaultOptions");
const enhanceLROStatus = require("@eluvio/elv-lro-status/enhanceLROStatus");

class IngestStore {
  libraries;
  accessGroups;
  loaded;
  jobs;
  job;
  contentTypes;
  showDialog = false;
  dialog = {
    title: "",
    description: ""
  }
  dialogResponse = null;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  get libraries() {
    return this.libraries;
  }

  get contentTypes() {
    return this.contentTypes;
  }

  GetLibrary = (libraryId) => {
    return this.libraries[libraryId];
  }

  SetJob(jobId) {
    this.job = this.jobs[jobId];
  }

  UpdateIngestJobs({jobs}) {
    this.jobs = jobs;
  }

  UpdateIngestObject = ({id, data}) => {
    if(!this.jobs) { this.jobs = {}; }

    if(!this.jobs[id]) {
      this.jobs[id] = {
        currentStep: "",
        upload: {},
        ingest: {},
        finalize: {},
        lastUpdatedTime: new Date().toISOString(),
        active: true
      };
    }

    data.lastUpdatedTime = new Date().toISOString();
    this.jobs[id] = Object.assign(
      this.jobs[id],
      data
    );

    try {
      localStorage.setItem(
        "elv-jobs",
        this.client.utils.B64(JSON.stringify(this.jobs))
      );
    } catch(error) {
      let errorMessage;
      if(error instanceof DOMException && error.code === 22) {
        errorMessage = "Storage quota exceeded. Please clear jobs to free up space.";
      } else {
        errorMessage = "Unable to store job data.";
      }

      return this.HandleError({
        step: "upload",
        errorMessage,
        error,
        id
      });
    }

    this.UpdateIngestJobs({jobs: this.jobs});
  }

  ClearInactiveJobs = () => {
    const jobs = {};
    Object.keys(this.jobs).forEach(jobId => {
      let job = this.jobs[jobId];
      if(!job.lastUpdatedTime || !job.active) { return; }

      const lastUpdatedDifference = (
        new Date(new Date().toISOString()).valueOf() - new Date(job.lastUpdatedTime).valueOf()
      ) / 1000;

      if(lastUpdatedDifference <= 120) {
        jobs[jobId] = Object.assign({}, job);
      }
    });

    this.UpdateIngestJobs({jobs});
    localStorage.setItem(
      "elv-jobs",
      this.client.utils.B64(JSON.stringify(jobs))
    );
  }

  ShowWarningDialog = flow(function * ({title, description}) {
    this.showDialog = true;
    this.dialog = {
      title,
      description
    };

    return yield new Promise(resolve => {
      this.dialogResponse = resolve;
    });
  });

  HideWarningDialog = (response) => {
    this.showDialog = false;
    this.dialogResponse(response);
  }

  WaitForPublish = flow (function * ({hash, objectId}) {
    let publishFinished = false;
    let latestObjectHash;
    while(!publishFinished) {
      try {
        latestObjectHash = yield this.client.LatestVersionHash({
          objectId
        });

        if(latestObjectHash === hash) {
          publishFinished = true;
        } else {
          yield new Promise(resolve => setTimeout(resolve, 15000));
        }
      } catch(error) {
        console.error(`Waiting for master object publishing hash:${hash}. Retrying.`, error);
        yield new Promise(resolve => setTimeout(resolve, 7000));
      }
    }
  });

  RestrictAbrProfile = ({playbackEncryption, abrProfile}) => {
    let abrProfileExclude;

    if(playbackEncryption === "drm-all") {
      abrProfileExclude = ABR.ProfileExcludeClear(abrProfile);
    } else if(playbackEncryption === "drm-public") {
      abrProfileExclude = DrmPublicProfile({abrProfile});
    } else if(playbackEncryption === "drm-restricted") {
      abrProfileExclude = DrmWidevineFairplayProfile({abrProfile});
    } else if(playbackEncryption === "clear") {
      abrProfileExclude = ABR.ProfileExcludeDRM(abrProfile);

      if(abrProfileExclude && abrProfileExclude.result) {
        abrProfileExclude.result.store_clear = true;
      }
    }

    return abrProfileExclude;
  };

  HandleError = ({id, step, error, errorMessage}) => {
    this.UpdateIngestObject({
      id,
      data: {
        ...this.jobs[id],
        [step]: {
          ...this.jobs[id][step],
          runState: "failed"
        },
        error: true,
        errorMessage,
        errorLog: typeof error === "object" ? JSON.stringify(error, null, 2) : error,
        active: false
      }
    });

    console.error(errorMessage, error);
    throw error;
  }

  ContentType = flow(function * ({name, typeId, versionHash}) {
    return yield this.client.ContentType({name, typeId, versionHash});
  });

  LoadDependencies = flow(function * () {
    try {
      yield this.LoadLibraries();
      yield this.LoadAccessGroups();
      yield this.LoadContentTypes();
    } finally {
      this.loaded = true;
    }
  });

  LoadContentTypes = flow(function * () {
    try {
      if(!this.contentTypes) { this.contentTypes = {}; }

      const loadedTypes = yield this.client.ContentTypes();
      const sortedTypes = Object.entries(loadedTypes)
        .sort(([id1, obj1], [id2, obj2]) => (obj1.name || id1).localeCompare(obj2.name || id2))
        .map(([key, value]) => (
          [key, {name: value.name || key}]
        ));

      this.contentTypes = Object.fromEntries(sortedTypes);
    } catch(error) {
      console.error("Failed to load content types", error);
    }
  });

  LoadLibraries = flow(function * () {
    try {
      if(!this.libraries) {
        this.libraries = {};
        let loadedLibraries = {};

        const libraryIds = yield this.client.ContentLibraries() || [];
        yield Promise.all(
          libraryIds.map(async libraryId => {
            let response;
            try {
              response = (await this.client.ContentObjectMetadata({
                libraryId,
                objectId: libraryId.replace(/^ilib/, "iq__"),
                select: [
                  "public/name",
                  "abr",
                  "elv/media/drm/fps/cert"
                ]
              }));
            } catch(error) {
              console.error(`Unable to load metadata for ${libraryId}`);
            }

            if(!response) { return; }

            const drmCert = (
              response.elv &&
              response.elv.media &&
              response.elv.media.drm &&
              response.elv.media.drm.fps &&
              response.elv.media.drm.fps.cert
            );

            // Test prep of abr profile to determine
            // relevant drm formats
            const abrProfileSupport = {
              drmAll: false,
              drmPublic: false,
              drmRestricted: false,
              clear: false
            };

            if(response.abr && response.abr.default_profile) {
              ["drm-all", "drm-public", "drm-restricted", "clear"].forEach(drmFormat => {
                const formatSupportMap = {
                  "drm-all": "drmAll",
                  "drm-public": "drmPublic",
                  "drm-restricted": "drmRestricted",
                  "clear": "clear"
                };

                const restrictedProfile = this.RestrictAbrProfile({
                  playbackEncryption: drmFormat,
                  abrProfile: Object.assign(
                    {},
                    response.abr && response.abr.default_profile
                  )
                });

                if(
                  restrictedProfile.ok &&
                  restrictedProfile.result &&
                  Object.keys(restrictedProfile.result.playout_formats || {}).length > 0 &&
                  Object.values(restrictedProfile.result.playout_formats).some(format => format)
                ) {
                  abrProfileSupport[formatSupportMap[drmFormat]] = true;
                }
              });
            }

            loadedLibraries[libraryId] = {
              libraryId,
              name: response.public && response.public.name || libraryId,
              abr: response.abr,
              abrProfileSupport,
              drmCert
            };
          })
        );

        // eslint-disable-next-line no-unused-vars
        const sortedArray = Object.entries(loadedLibraries).sort(([id1, obj1], [id2, obj2]) => obj1.name.localeCompare(obj2.name));
        this.libraries = Object.fromEntries(sortedArray);
      }
    } catch(error) {
      console.error("Failed to load libraries", error);
    }
  });

  LoadAccessGroups = flow(function * () {
    try {
      if(!this.accessGroups) {
        this.accessGroups = {};
        const accessGroups = yield this.client.ListAccessGroups() || [];
        accessGroups
          .sort((a, b) => (a.meta.name || a.id).localeCompare(b.meta.name || b.id))
          .map(async accessGroup => {
            if(accessGroup.meta["name"]){
              this.accessGroups[accessGroup.meta["name"]] = accessGroup;
            } else {
              this.accessGroups[accessGroup.id] = accessGroup;
            }
          });
      }
    } catch(error) {
      console.error("Failed to load access groups", error);
    }
  });

  GetContentAdminsGroupAddress = flow(function * () {
    try {
      const tenantContractId = yield this.client.userProfileClient.TenantContractId();
      const contentAdminGroupAddress = yield this.client.CallContractMethod({
        contractAddress: this.client.utils.HashToAddress(tenantContractId),
        methodName: "groupsMapping",
        methodArgs: ["content_admin", 0],
        formatArguments: true,
      });

      if(!contentAdminGroupAddress) {
        throw "Unable to determine content admins group address";
      }

      return contentAdminGroupAddress;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Error retrieving content admins group:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });

  AddContentAdminsGroupPermissions = flow(function * ({objectId}) {
    try {
      // Automatically add permissions for content manage
      const contentAdminsGroupAddress = yield this.GetContentAdminsGroupAddress();
      yield this.client.AddContentObjectGroupPermission({
        objectId,
        groupAddress: contentAdminsGroupAddress,
        permission: "manage"
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to add new object to content admins group:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });

  CreateContentObject = flow(function * ({
    libraryId,
    mezContentType,
    formData
  }) {
    let createResponse;
    let totalFileSize;
    try {
      createResponse = yield this.client.CreateContentObject({
        libraryId,
        options: mezContentType ? { type: mezContentType } : {}
      });

      if(formData.master.files) {
        totalFileSize = 0;
        formData.master.files.forEach(file => totalFileSize += file.size);
      }

      yield this.AddContentAdminsGroupPermissions({objectId: createResponse.id});

      try {
        yield this.client.SetVisibility({
          id: createResponse.id,
          visibility: 0
        });

        formData.contentType = mezContentType;
        formData.master.writeToken = createResponse.writeToken;

        this.UpdateIngestObject({
          id: createResponse.id,
          data: {
            currentStep: "create",
            formData,
            create: {
              complete: true,
              runState: "finished"
            },
            size: totalFileSize,
            masterLibraryId: libraryId,
            masterObjectId: createResponse.id,
            masterWriteToken: createResponse.writeToken,
            masterNodeUrl: createResponse.nodeUrl,
            contentType: mezContentType
          }
        });

        return createResponse;
      } catch(error) {
        console.error("Unable to set visibility.", error);
      }
    } catch(error) {
      console.error("Failed to create content object.", error);
      return { error };
    }
  });

  CreateProductionMaster = flow(function * ({
    libraryId,
    files,
    title,
    displayTitle,
    abr,
    accessGroupAddress,
    playbackEncryption="clear",
    description,
    s3Url,
    access=[],
    copy,
    masterObjectId,
    writeToken
  }) {
    ValidateLibrary(libraryId);

    if(writeToken) {
      ValidateWriteToken(writeToken);
    }

    const finalize = !writeToken;

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "upload"
      }
    });

    // Create encryption conk
    try {
      yield this.client.CreateEncryptionConk({
        libraryId: libraryId,
        objectId: masterObjectId,
        writeToken,
        createKMSConk: true
      });
    } catch(error) {
      return this.HandleError({
        step: "upload",
        errorMessage: "Unable to create encryption conk.",
        error,
        id: masterObjectId
      });
    }

    try {
      const UploadCallback = (progress) => {
        let uploadSum = 0;
        let totalSum = 0;
        Object.values(progress).forEach(fileProgress => {
          uploadSum += fileProgress.uploaded;
          totalSum += fileProgress.total;
        });

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            upload: {
              percentage: Math.round((uploadSum / totalSum) * 100)
            }
          }
        });
      };

      // Upload files
      if(access.length > 0) {
        const s3Reference = access[0];
        const region = s3Reference.remote_access.storage_endpoint.region;
        const bucket = s3Reference.remote_access.path.replace(/\/$/, "");
        const accessKey = s3Reference.remote_access.cloud_credentials.access_key_id;
        const secret = s3Reference.remote_access.cloud_credentials.secret_access_key;
        const signedUrl = s3Reference.remote_access.cloud_credentials.signed_url;
        const baseName = decodeURIComponent(Path.basename(
          s3Url ? s3Url : signedUrl.split("?")[0]
        ));
        // should be full path when using AK/Secret
        const source = s3Url ? s3Url : baseName;

        yield this.client.UploadFilesFromS3({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          fileInfo: [{
            path: baseName,
            source
          }],
          region,
          bucket,
          accessKey,
          secret,
          signedUrl,
          copy,
          encryption: "cgck"
        });

        // Calculate file size for S3 upload. Local upload has been calculated already
        let fileSize;
        const fileMeta = yield this.client.ContentObjectMetadata({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          metadataSubtree: `/files/${baseName}`
        });
        fileSize = fileMeta["."].size;

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            size: fileSize
          }
        });
      } else {
        const fileInfo = yield FileInfo("", files);

        yield this.client.UploadFiles({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          fileInfo,
          callback: UploadCallback,
          encryption: "cgck"
        });
      }
    } catch(error) {
      return this.HandleError({
        step: "upload",
        errorMessage: "Unable to upload files.",
        error,
        id: masterObjectId
      });
    }

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        upload: {
          ...this.jobs[masterObjectId].upload,
          complete: true,
          runState: "finished"
        },
        currentStep: "ingest"
      }
    });

    // Bitcode method
    let logs;
    let warnings;
    let errors;

    try {
      const response = yield this.client.CallBitcodeMethod({
        libraryId,
        objectId: masterObjectId,
        writeToken: writeToken,
        method: UrlJoin("media", "production_master", "init"),
        body: {
          access
        },
        constant: false
      });
      logs = response.logs;
      warnings = response.warnings;
      errors = response.errors;

      if(errors && errors.length) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to get media information from production master.",
          error: errors.map(e => e.toString()).join(", "),
          id: masterObjectId
        });
      }
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to get media information from production master.",
        error,
        id: masterObjectId
      });
    }

    // Check for audio and video streams
    try {
      const streams = (yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        metadataSubtree: UrlJoin("production_master", "variants", "default", "streams")
      }));

      let unsupportedStreams = [];
      if(!streams.audio) { unsupportedStreams.push("audio"); }
      if(!streams.video) { unsupportedStreams.push("video"); }

      if(unsupportedStreams.length > 0) {
        const response = yield this.ShowWarningDialog({
          title: "Streams Not Found",
          description: `No suitable ${unsupportedStreams.join(", ")} streams found in the media file. Would you like to continue the ingest?`
        });

        if(response === "NO") {
          return this.HandleError({
            step: "ingest",
            errorMessage: "Canceled ingest due to missing streams.",
            id: masterObjectId
          });
        }
      }

      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          streams: {
            audio: !!streams.audio,
            video: !!streams.video
          }
        }
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to get streams from production master.",
        error,
        id: masterObjectId
      });
    }

    // Merge metadata
    try {
      yield this.client.MergeMetadata({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        metadata: {
          public: {
            name: `${title} [ingest: uploading] MASTER`,
            description,
            asset_metadata: {
              title,
              display_title: displayTitle
            }
          },
          reference: true,
          elv_created_at: new Date().getTime()
        },
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to update metadata with uploading state.",
        error,
        id: masterObjectId
      });
    }

    // Create ABR Ladder
    let {abrProfile} = yield this.CreateABRLadder({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      abr
    });

    // Update name to remove [ingest: uploading]
    try {
      yield this.client.ReplaceMetadata({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        metadataSubtree: "public/name",
        metadata: `${title} MASTER`
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to update metadata after uploading.",
        error,
        id: masterObjectId
      });
    }

    // Finalize object
    let finalizeResponse;
    if(finalize) {
      try {
        finalizeResponse = yield this.client.FinalizeContentObject({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          commitMessage: "Create master object",
          awaitCommitConfirmation: false
        });
      } catch(error) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to finalize production master.",
          error,
          id: masterObjectId
        });
      }
    }

    if(accessGroupAddress) {
      try {
        yield this.client.AddContentObjectGroupPermission({objectId: masterObjectId, groupAddress: accessGroupAddress, permission: "manage"});
      } catch(error) {
        return this.HandleError({
          step: "ingest",
          errorMessage: `Unable to add group permission for group: ${accessGroupAddress}`,
          error,
          id: masterObjectId
        });
      }
    }

    if(playbackEncryption !== "custom") {
      let abrProfileExclude = this.RestrictAbrProfile({playbackEncryption, abrProfile});

      if(abrProfileExclude.ok) {
        abrProfile = abrProfileExclude.result;
      } else {
        return this.HandleError({
          step: "ingest",
          errorMessage: "ABR Profile has no relevant playout formats.",
          error: abrProfileExclude,
          id: masterObjectId
        });
      }
    }

    return Object.assign(
      finalizeResponse || {}, {
        jobId: masterObjectId,
        abrProfile,
        access,
        errors: errors || [],
        logs: logs || [],
        warnings: warnings || []
      }
    );
  });

  CreateABRMezzanine = flow(function * ({
    libraryId,
    masterObjectId,
    accessGroupAddress,
    abrProfile,
    name,
    description,
    displayTitle,
    masterVersionHash,
    masterWriteToken,
    writeToken,
    type,
    newObject=false,
    variant="default",
    offeringKey="default",
    access=[],
    permission,
    jobId
  }) {
    let createResponse;
    const jobIdRef = masterObjectId || jobId;

    try {
      createResponse = yield this.client.CreateABRMezzanine({
        libraryId,
        objectId: newObject ? undefined : masterObjectId,
        type,
        name,
        masterVersionHash,
        masterWriteToken,
        writeToken,
        abrProfile,
        variant,
        offeringKey
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to create mezzanine object.",
        error,
        id: jobIdRef
      });
    }
    const objectId = createResponse.id;

    try {
      yield this.client.SetPermission({
        objectId,
        writeToken,
        permission
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to set permission level.",
        error,
        id: masterObjectId
      });
    }

    try {
      const response = yield this.client.StartABRMezzanineJobs({
        libraryId,
        objectId,
        writeToken,
        access
      });

      this.UpdateIngestObject({
        id: jobIdRef,
        data: {
          ...this.jobs[jobIdRef],
          mezLibraryId: libraryId,
          mezObjectId: objectId,
          mezWriteToken: writeToken,
          mezNodeUrl: response.nodeUrl,
        }
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to start ABR mezzanine jobs.",
        error,
        id: jobIdRef
      });
    }

    let done;
    let errorState;
    let statusIntervalId;
    while(!done && !errorState) {
      let status;
      try {
        status = yield this.client.LROStatus({
          libraryId,
          objectId,
          writeToken
        });
      } catch(error) {
        errorState = true;
        if(statusIntervalId) clearInterval(statusIntervalId);

        return this.HandleError({
          step: "ingest",
          errorMessage: "Failed to get LRO status.",
          error,
          id: jobIdRef
        });
      }

      if(status === undefined) {
        errorState = true;
        if(statusIntervalId) clearInterval(statusIntervalId);

        return this.HandleError({
          step: "ingest",
          errorMessage: "Received no job status information from server.",
          id: jobIdRef
        });
      }

      if(statusIntervalId) clearInterval(statusIntervalId);
      statusIntervalId = setInterval( async () => {
        const options = Object.assign(
          defaultOptions(),
          {currentTime: new Date()}
        );
        const enhancedStatus = enhanceLROStatus(options, status);

        if(!enhancedStatus.ok) {
          clearInterval(statusIntervalId);
          errorState = true;

          return this.HandleError({
            step: "ingest",
            errorMessage: "Unable to transcode selected file.",
            id: jobIdRef
          });
        }

        const {estimated_time_left_seconds, estimated_time_left_h_m_s, run_state} = enhancedStatus.result.summary;

        this.UpdateIngestObject({
          id: jobIdRef,
          data: {
            ...this.jobs[jobIdRef],
            mezObjectId: objectId,
            ingest: {
              runState: run_state,
              estimatedTimeLeft:
              (estimated_time_left_seconds === undefined && run_state === "running") ? "Calculating..." : estimated_time_left_h_m_s ? `${estimated_time_left_h_m_s} remaining` : ""
            },
            formData: {
              ...this.jobs[jobIdRef].formData,
              mez: {
                libraryId,
                masterObjectId: jobIdRef,
                abrProfile,
                accessGroup: accessGroupAddress,
                name,
                description,
                displayTitle,
                masterVersionHash,
                type,
                newObject,
                variant,
                offeringKey,
                access
              }
            }
          }
        });

        if(run_state !== "running") {
          clearInterval(statusIntervalId);
          done = true;

          await this.GenerateEmbedUrl({
            objectId: jobIdRef,
            mezId: objectId
          });

          try {
            await this.client.MergeMetadata({
              libraryId,
              objectId,
              writeToken,
              metadata: {
                public: {
                  name: `${name} MEZ`,
                  description,
                  asset_metadata: {
                    title: name,
                    display_title: displayTitle
                  }
                }
              }
            });
          } catch(error) {
            clearInterval(statusIntervalId);
            errorState = true;

            return this.HandleError({
              step: "ingest",
              errorMessage: "Unable to update metadata.",
              error,
              id: jobIdRef
            });
          }

          this.FinalizeABRMezzanine({
            libraryId,
            objectId,
            masterObjectId: jobIdRef,
            writeToken
          });

          if(accessGroupAddress) {
            try {
              await this.client.AddContentObjectGroupPermission({objectId, groupAddress: accessGroupAddress, permission: "manage"});
            } catch(error) {
              clearInterval(statusIntervalId);
              errorState = true;

              return this.HandleError({
                step: "ingest",
                errorMessage: `Unable to add group permission for group: ${accessGroupAddress}`,
                error,
                id: jobIdRef
              });
            }
          }
        }
      }, 1000);

      yield new Promise(resolve => setTimeout(resolve, 15000));
    }
  });

  CreateABRLadder = flow(function * ({
    libraryId,
    objectId,
    writeToken,
    abr
  }) {
    try {
      const {production_master} = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        writeToken,
        select: [
          "production_master/sources",
          "production_master/variants/default"
        ]
      });

      if(!production_master || !production_master.sources || !production_master.variants || !production_master.variants.default) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to create ABR profile.",
          id: objectId
        });
      }

      const generatedProfile = ABR.ABRProfileForVariant(
        production_master.sources,
        production_master.variants.default,
        abr ? abr.default_profile : undefined
      );

      if(!generatedProfile.ok) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to create ABR profile.",
          error: generatedProfile,
          id: objectId
        });
      }

      return {
        abrProfile: generatedProfile.result
      };
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to create ABR profile.",
        error,
        id: objectId
      });
    }
  });

  FinalizeABRMezzanine = flow(function * ({
    libraryId,
    objectId,
    masterObjectId,
    writeToken
  }) {
    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "finalize"
      }
    });

    try {
      const finalizeAbrResponse = yield this.client.FinalizeABRMezzanine({
        libraryId,
        objectId,
        writeToken
      });

      const formData = this.jobs[masterObjectId || finalizeAbrResponse.id].formData;
      delete formData.master.abr;

      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          formData,
          finalize: {
            complete: true,
            runState: "finished",
            mezzanineHash: finalizeAbrResponse.hash,
            objectId: finalizeAbrResponse.id
          },
          active: false
        }
      });
    } catch(error) {
      return this.HandleError({
        step: "finalize",
        errorMessage: "Unable to finalize mezzanine object.",
        error,
        id: objectId
      });
    }
  });

  GenerateEmbedUrl = flow(function * ({objectId, mezId}) {
    const url = yield this.client.EmbedUrl({objectId: mezId});

    this.UpdateIngestObject({
      id: objectId,
      data: {
        ...this.jobs[objectId],
        embedUrl: url
      }
    });

    return url;
  });
}

export default IngestStore;
