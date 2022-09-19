import {flow, makeAutoObservable, toJS} from "mobx";
import {ValidateLibrary} from "@eluvio/elv-client-js/src/Validation";
import UrlJoin from "url-join";
import {FileInfo} from "../utils/Files";
import {ingestStore} from "./index";
const ABR = require("@eluvio/elv-abr-profile");
const defaultOptions = require("@eluvio/elv-lro-status/defaultOptions");
const enhanceLROStatus = require("@eluvio/elv-lro-status/enhanceLROStatus");

class IngestStore {
  libraries;
  loaded;
  jobs;
  job;
  ingestErrors = {
    errors: [],
    warnings: []
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get client() {
    return this.rootStore.client;
  }

  get libraries() {
    return this.libraries;
  }

  GetLibrary = (libraryId) => {
    return this.libraries[libraryId];
  }

  SetJob = (jobId) => {
    this.job = this.jobs[jobId];
  }

  UpdateIngestJobs = ({jobs}) => {
    this.jobs = jobs;
  }

  LoadJobs = () => {
    const localStorageJobs = localStorage.getItem("elv-jobs");
    let debounceTimeout;
    let parsedJobs = {};

    if(localStorageJobs) {
      parsedJobs = JSON.parse(atob(localStorageJobs));
    }

    ingestStore.UpdateIngestJobs({jobs: parsedJobs});
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      console.log("here?");
      this.StartJobs();
    }, 2000);
    console.log("jobs", toJS(this.jobs));
  }

  RemoveJob = ({id}) => {
    const jobs = this.jobs;
    if(id in jobs) { delete jobs[id]; }
    localStorage.setItem(
      "elv-jobs",
      btoa(JSON.stringify(jobs))
    );
    this.UpdateIngestJobs({jobs});
  }

  UpdateIngestObject = ({id, data}) => {
    if(!this.jobs) { this.jobs = {}; }

    if(!this.jobs[id]) {
      this.jobs[id] = {
        currentStep: "",
        upload: {},
        ingest: {},
        finalize: {}
      };
    }

    this.jobs[id] = Object.assign(
      this.jobs[id],
      data
    );
    localStorage.setItem(
      "elv-jobs",
      btoa(JSON.stringify(this.jobs))
    );

    this.UpdateIngestJobs({jobs: this.jobs});
  }

  UpdateIngestErrors = (type, message) => {
    this.ingestErrors[type].push(message);
  }

  ClearJobs = () => {
    this.jobs = {};
    localStorage.removeItem("elv-jobs");
  }

  GenerateEmbedUrl = ({versionHash, objectId}) => {
    const networkInfo = rootStore.networkInfo;
    let embedUrl = new URL("https://embed.v3.contentfabric.io");
    const networkName = networkInfo.name === "demov3" ? "demo" : (networkInfo.name === "test" && networkInfo.id === 955205) ? "testv4" : networkInfo.name;

    embedUrl.searchParams.set("p", "");
    embedUrl.searchParams.set("lp", "");
    embedUrl.searchParams.set("net", networkName);
    embedUrl.searchParams.set("ct", "s");

    if(versionHash) {
      embedUrl.searchParams.set("vid", versionHash);
    } else {
      embedUrl.searchParams.set("oid", objectId);
    }

    return embedUrl.toString();
  };

  WaitForPublish = flow (function * ({hash, objectId}) {
    let publishFinished = false;
    let latestObjectHash;
    while(!publishFinished) {
      latestObjectHash = yield this.client.LatestVersionHash({
        objectId
      });

      if(latestObjectHash === hash) {
        publishFinished = true;
      } else {
        yield new Promise(resolve => setTimeout(resolve, 15000));
      }
    }
  });

  StartJobs = flow (function * () {
    for(let jobId of Object.keys(this.jobs || {})) {
      const job = this.jobs[jobId];
      console.log("job", toJS(job));

      const {abr, access, files, libraryId, title, description, writeToken, playbackEncryption} = job.formData.master;
      const mezFormData = job.formData.mez;
      console.log("mezFormData", mezFormData);

      let response;
      if(job.currentStep === "upload" && job.upload.runState === "finished") {
        response = yield this.CreateProductionMaster({
          libraryId,
          files,
          title,
          description,
          abr: JSON.parse(abr),
          access: JSON.parse(access),
          masterObjectId: jobId,
          writeToken,
          playbackEncryption
        });
        console.log("response", response);

        // yield new Promise(resolve => setTimeout(resolve, 2000));

        yield this.WaitForPublish({
          hash: response.hash,
          objectId: jobId
        });
      }

      if(job.currentStep === "ingest") {
        yield ingestStore.CreateABRMezzanine({
          libraryId: mezFormData.libraryId,
          masterObjectId: job.upload.masterObjectId,
          masterVersionHash: job.upload.masterHash,
          abrProfile: JSON.parse(job.upload.abrProfile),
          type: job.upload.contentTypeId,
          name: mezFormData.name,
          description: mezFormData.description,
          displayName: mezFormData.displayName,
          newObject: mezFormData.newObject,
          access: JSON.parse(access)
        });
      }
    }
  });

  LoadLibraries = flow(function * () {
    try {
      if(!this.libraries) {
        this.libraries = {};

        const libraryIds = yield this.client.ContentLibraries();
        yield Promise.all(
          libraryIds.map(async libraryId => {
            const response = (await this.client.ContentObjectMetadata({
              libraryId,
              objectId: libraryId.replace(/^ilib/, "iq__"),
              select: [
                "public/name",
                "abr",
                "elv/media/drm/fps/cert"
              ]
            }));

            this.libraries[libraryId] = {
              libraryId,
              name: response.public && response.public.name || libraryId,
              abr: response.abr,
              drmCert: response.elv &&
                response.elv.media &&
                response.elv.media.drm &&
                response.elv.media.drm.fps &&
                response.elv.media.drm.fps.cert
            };
          })
        );
      }
    } catch(error) {
      console.error("Failed to load libraries");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });

  CreateContentObject = flow(function * ({libraryId, mezContentType, formData}) {
    try {
      const response = yield this.client.CreateContentObject({
        libraryId,
        options: mezContentType ? { type: mezContentType } : {}
      });

      formData.master.writeToken = response.write_token;
      formData.master.masterObjectId = response.id;

      this.UpdateIngestObject({
        id: response.id,
        data: {
          currentStep: "create",
          formData,
          create: {
            complete: true
          }
        }
      });

      return response;
    } catch(error) {
      console.error("Failed to create content object");
      console.error(error);
    }
  });

  UploadFiles = flow(function * ({
    libraryId,
    masterObjectId,
    files,
    playbackEncryption,
    s3Url,
    access=[],
    copy,
    writeToken,
    Callback
  }) {
    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "upload",
        upload: {
          runState: "running"
        }
      }
    });

    try {
      const UploadCallback = (progress) => {
        let uploadSum = 0;
        let totalSum = 0;
        Object.values(progress).forEach(fileProgress => {
          uploadSum += fileProgress.uploaded;
          totalSum += fileProgress.total;
        });
        const percentage = Math.round((uploadSum / totalSum) * 100);
        Callback(percentage);

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            upload: {
              ...this.jobs[masterObjectId].upload,
              percentage
            }
          }
        });
      };

      if(s3Url && access.length > 0) {
        const s3prefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified
        const s3Reference = access[0];

        const region = s3Reference.remote_access.storage_endpoint.region;
        const bucket = s3Reference.remote_access.path.replace(/\/$/, "");
        const path = s3Url.replace(s3prefixRegex, "");
        const accessKey = s3Reference.remote_access.cloud_credentials.access_key_id;
        const secret = s3Reference.remote_access.cloud_credentials.secret_access_key;
        const signedUrl = s3Reference.remote_access.cloud_credentials.signed_url;

        yield this.client.UploadFilesFromS3({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          fileInfo: [{
            path,
            source: s3Url
          }],
          region,
          bucket,
          accessKey,
          secret,
          signedUrl,
          copy,
          encryption: ["both", "drm"].includes(playbackEncryption) ? "cgck" : "none"
        });
      } else {
        const fileInfo = yield FileInfo({path: "", fileList: files});
        console.log("fileinfo", fileInfo);

        yield this.client.UploadFiles({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          fileInfo,
          callback: UploadCallback,
          encryption: ["both", "drm"].includes(playbackEncryption) ? "cgck" : "none"
        });
      }
    } catch(error) {
      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          currentStep: "failed"
        }
      });
      console.error("Failed to upload files for object: ", masterObjectId);
      console.error(error);
    } finally {
      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          upload: {
            ...this.jobs[masterObjectId].upload,
            runState: "finished"
          }
        }
      });
    }
  });

  CreateProductionMaster = flow(function * ({
    libraryId,
    title,
    abr,
    playbackEncryption="both",
    description,
    access=[],
    masterObjectId,
    writeToken
  }) {
    ValidateLibrary(libraryId);

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "ingest"
      }
    });
    // Create encryption conk
    yield this.client.CreateEncryptionConk({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      createKMSConk: true
    });

    // Bitcode method
    const {logs, warnings, errors} = yield this.client.CallBitcodeMethod({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      method: UrlJoin("media", "production_master", "init"),
      body: {
        access
      },
      constant: false
    });

    if(errors) {
      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          currentStep: "failed"
        }
      });
      console.error("Failed to call media/production_master/init");
      this.UpdateIngestErrors("errors", "Error: Unable to ingest selected media file.");
    }

    // Check if audio and video streams
    const streams = (yield this.client.ContentObjectMetadata({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      metadataSubtree: UrlJoin("production_master", "variants", "default", "streams")
    }));

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        upload: {
          ...this.jobs[masterObjectId].upload,
          streams: Object.keys(streams || {})
        }
      }
    });

    // Merge metadata
    yield this.client.MergeMetadata({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      metadata: {
        public: {
          name: `${title} [ingest: uploading] MASTER`,
          description,
          asset_metadata: {
            display_title: `${title} [ingest: uploading] MASTER`
          }
        },
        reference: true,
        elv_created_at: new Date().getTime()
      },
    });

    // Create ABR Ladder
    let {abrProfile, contentTypeId} = yield this.CreateABRLadder({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      abr
    });

    // Update name to remove [ingest: uploading]
    yield this.client.MergeMetadata({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      metadata: {
        public: {
          name: `${title} MASTER`,
          description,
          asset_metadata: {
            display_title: `${title} MASTER`
          }
        },
        reference: true,
        elv_created_at: new Date().getTime()
      },
    });

    // Finalize object
    const finalizeResponse = yield this.client.FinalizeContentObject({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      commitMessage: "Create master object",
      awaitCommitConfirmation: false
    });

    if(playbackEncryption !== "both") {
      let abrProfileExclude;

      if(playbackEncryption === "drm") {
        abrProfileExclude = ABR.ProfileExcludeClear(abrProfile);
      } else if(playbackEncryption === "clear") {
        abrProfileExclude = ABR.ProfileExcludeDRM(abrProfile);
      }

      if(abrProfileExclude.ok) {
        abrProfile = abrProfileExclude.result;
      } else {
        console.error("ABR Profile has no relevant playout formats.", abrProfileExclude);
        this.UpdateIngestErrors("errors", "Error: ABR Profile has no relevant playout formats.");
      }
    }

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        upload: {
          ...this.jobs[masterObjectId].upload,
          abrProfile: JSON.stringify(abrProfile),
          masterObjectId: finalizeResponse.id,
          masterHash: finalizeResponse.hash,
          contentTypeId: contentTypeId
        }
      }
    });

    return Object.assign(
      finalizeResponse, {
        errors: errors || [],
        logs: logs || [],
        warnings: warnings || []
      }
    );
  });

  CreateABRMezzanine = flow(function * ({
    libraryId,
    masterObjectId,
    abrProfile,
    name,
    description,
    displayName,
    masterVersionHash,
    type,
    newObject=false,
    variant="default",
    offeringKey="default",
    access=[]
  }) {
    console.log("Mez data", {
      libraryId,
      masterObjectId,
      abrProfile,
      name,
      description,
      displayName,
      masterVersionHash,
      type,
      newObject,
      variant,
      offeringKey,
      access
    });
    let createResponse;
    try {
      createResponse = yield this.client.CreateABRMezzanine({
        libraryId,
        objectId: newObject ? undefined : masterObjectId,
        type,
        name: `${name} [ingest: transcoding] MEZ`,
        masterVersionHash,
        abrProfile,
        variant,
        offeringKey
      });
    } catch(error) {
      console.error(`Failed to create mezzanine object: ${masterObjectId}`);
      console.error(error);
    }
    const objectId = createResponse.id;

    yield this.WaitForPublish({
      hash: createResponse.hash,
      objectId
    });

    const { writeToken, hash } = yield this.client.StartABRMezzanineJobs({
      libraryId,
      objectId,
      access
    });

    yield this.WaitForPublish({
      hash,
      objectId
    });

    let done;
    let error;
    let statusIntervalId;
    while(!done && !error) {
      let status = yield this.client.LROStatus({
        libraryId,
        objectId
      });

      if(status === undefined) {
        console.error("Received no job status information from server.");
        return;
      }

      if(statusIntervalId) clearInterval(statusIntervalId);
      statusIntervalId = setInterval( async () => {
        const options = Object.assign(
          defaultOptions(),
          {currentTime: new Date()}
        );
        const enhancedStatus = enhanceLROStatus(options, status);

        if(!enhancedStatus.ok) {
          console.error("Error processing LRO status");
          this.UpdateIngestErrors("errors", "Error: Unable to transcode selected file.");
          clearInterval(statusIntervalId);
          error = true;
          return;
        }

        const {estimated_time_left_seconds, estimated_time_left_h_m_s, run_state} = enhancedStatus.result.summary;

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            mezObjectId: objectId,
            ingest: {
              runState: run_state,
              estimatedTimeLeft:
              (!estimated_time_left_seconds && run_state === "running") ? "Calculating..." : estimated_time_left_h_m_s ? `${estimated_time_left_h_m_s} remaining` : ""
            },
            formData: {
              ...this.jobs[masterObjectId].formData,
              mez: {
                libraryId,
                masterObjectId,
                abrProfile,
                name,
                description,
                displayName,
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

          const embedUrl = this.GenerateEmbedUrl({
            objectId: masterObjectId
          });

          await this.client.MergeMetadata({
            libraryId,
            objectId,
            writeToken,
            metadata: {
              public: {
                name: `${name} MEZ`,
                description,
                asset_metadata: {
                  display_title: `${name} MEZ`,
                  nft: {
                    name,
                    display_name: displayName,
                    description,
                    created_at: new Date(),
                    playable: true,
                    has_audio: this.jobs[masterObjectId].upload.streams.includes("audio"),
                    embed_url: embedUrl,
                    external_url: embedUrl
                  }
                }
              }
            }
          });

          this.FinalizeABRMezzanine({
            libraryId,
            objectId,
            masterObjectId
          });
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
        console.error("Unable to create ABR profile.");
        this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
        return;
      }

      const generatedProfile = ABR.ABRProfileForVariant(
        production_master.sources,
        production_master.variants.default,
        abr.default_profile
      );

      if(!generatedProfile.ok) {
        console.error("Generated profile returned error.", generatedProfile);
        this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
        return;
      }

      return {
        abrProfile: generatedProfile.result,
        contentTypeId: abr.mez_content_type
      };
    } catch(error) {
      console.error(`Failed to create ABR ladder for object: ${objectId}`);
      console.error(error);
      this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
    }
  });

  FinalizeABRMezzanine = flow(function * ({libraryId, objectId, masterObjectId}) {
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
        objectId
      });

      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          finalize: {
            complete: true,
            mezzanineHash: finalizeAbrResponse.hash,
            objectId: finalizeAbrResponse.id
          }
        }
      });
    } catch(error) {
      console.error("Unable to finalize mezzanine object");
      console.error(error);
      this.UpdateIngestErrors("errors", "Error: Unable to transcode selected file.");
    }
  });
}

export default IngestStore;
