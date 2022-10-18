import {flow, makeAutoObservable} from "mobx";
import {ValidateLibrary} from "@eluvio/elv-client-js/src/Validation";
import UrlJoin from "url-join";
import {FileInfo} from "Utils/Files";
import Path from "path";
const ABR = require("@eluvio/elv-abr-profile");
const defaultOptions = require("@eluvio/elv-lro-status/defaultOptions");
const enhanceLROStatus = require("@eluvio/elv-lro-status/enhanceLROStatus");

class IngestStore {
  libraries;
  accessGroups;
  loaded;
  jobs;
  job;
  ingestErrors = {
    errors: [],
    warnings: []
  };

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
        console.error(error);
        console.error(`Waiting for master object publishing hash:${hash}. Retrying.`);
        yield new Promise(resolve => setTimeout(resolve, 7000));
      }
    }
  });

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

  LoadLibraries = flow(function * () {
    try {
      if(!this.libraries) {
        this.libraries = {};

        const libraryIds = yield this.client.ContentLibraries() || [];
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

            if(!response) { return; }

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

  LoadAccessGroups = flow(function * () {
    try {
      if(!this.accessGroups) {
        this.accessGroups = {};
        const accessGroups = yield this.client.ListAccessGroups() || [];
        accessGroups.map(async accessGroup => {
          if(accessGroup.meta["name"]){
            this.accessGroups[accessGroup.meta["name"]] = accessGroup;
          } else {
            this.accessGroups[accessGroup.id] = accessGroup;
          }
        });
      }
    } catch(error) {
      console.error("Failed to load access groups");
      console.error(error);
    }
  });

  CreateContentObject = flow(function * ({libraryId, mezContentType, formData}) {
    try {
      const response = yield this.client.CreateContentObject({
        libraryId,
        options: mezContentType ? { type: mezContentType } : {}
      });

      yield this.client.SetVisibility({
        id: response.id,
        visibility: 0
      });

      formData.master.writeToken = response.write_token;
      formData.master.masterObjectId = response.id;

      this.UpdateIngestObject({
        id: response.id,
        data: {
          currentStep: "create",
          formData,
          create: {
            complete: true,
            runState: "finished"
          }
        }
      });

      return response;
    } catch(error) {
      console.error("Failed to create content object");
      console.error(error);
    }
  });

  CreateProductionMaster = flow(function * ({
    libraryId,
    files,
    title,
    abr,
    accessGroupAddress,
    playbackEncryption="both",
    description,
    s3Url,
    access=[],
    copy,
    masterObjectId,
    writeToken
  }) {
    ValidateLibrary(libraryId);

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "upload"
      }
    });

    // Create encryption conk
    yield this.client.CreateEncryptionConk({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      createKMSConk: true
    });

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
          encryption: ["both", "drm"].includes(playbackEncryption) ? "cgck" : "none"
        });
      } else {
        const fileInfo = yield FileInfo("", files);

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
          upload: {
            ...this.jobs[masterObjectId].upload,
            runState: "failed"
          }
        }
      });
      console.error("Failed to upload files for object: ", masterObjectId);
      console.error(error);
      return;
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
        writeToken,
        method: UrlJoin("media", "production_master", "init"),
        body: {
          access
        },
        constant: false
      });
      logs = response.logs;
      warnings = response.warnings;
      errors = response.errors;

      if(errors) {
        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            ingest: {
              runState: "failed"
            }
          }
        });
        console.error("Failed to call media/production_master/init");
        this.UpdateIngestErrors("errors", "Error: Unable to ingest selected media file.");
        return;
      }
    } catch(error) {
      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          ingest: {
            runState: "failed"
          }
        }
      });

      console.error(error);
      console.error(`Failed to probe files for object: ${masterObjectId}`);
      return;
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

    if(accessGroupAddress) {
      yield this.client.AddContentObjectGroupPermission({objectId:masterObjectId, groupAddress: accessGroupAddress, permission: "manage"});
    }

    if(playbackEncryption !== "custom") {
      let abrProfileExclude;

      if(playbackEncryption.includes("drm")) {
        abrProfileExclude = ABR.ProfileExcludeClear(abrProfile);
      } else if(playbackEncryption === "clear") {
        abrProfileExclude = ABR.ProfileExcludeDRM(abrProfile);
      }

      if(abrProfileExclude.ok) {
        abrProfile = abrProfileExclude.result;
      } else {
        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            ingest: {
              ...this.jobs[masterObjectId].ingest,
              runState: "failed"
            }
          }
        });
        console.error("ABR Profile has no relevant playout formats.", abrProfileExclude);
        this.UpdateIngestErrors("errors", "Error: ABR Profile has no relevant playout formats.");
        return;
      }
    }

    return Object.assign(
      finalizeResponse, {
        abrProfile,
        contentTypeId,
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
    displayName,
    masterVersionHash,
    type,
    newObject=false,
    variant="default",
    offeringKey="default",
    access=[]
  }) {
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
      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          ingest: {
            ...this.jobs[masterObjectId].ingest,
            runState: "failed"
          }
        }
      });

      console.error(`Failed to create mezzanine object: ${masterObjectId}`);
      console.error(error);
    }
    const objectId = createResponse.id;

    yield this.WaitForPublish({
      hash: createResponse.hash,
      libraryId,
      objectId
    });

    const { writeToken, hash } = yield this.client.StartABRMezzanineJobs({
      libraryId,
      objectId,
      access
    });

    yield this.WaitForPublish({
      hash,
      libraryId,
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
          this.UpdateIngestObject({
            id: masterObjectId,
            data: {
              ...this.jobs[masterObjectId],
              ingest: {
                ...this.jobs[masterObjectId].ingest,
                runState: "failed"
              }
            }
          });

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
                accessGroup : accessGroupAddress,
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

          if(accessGroupAddress) {
            await this.client.AddContentObjectGroupPermission({objectId, groupAddress: accessGroupAddress, permission: "manage"});
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
        this.UpdateIngestObject({
          id: objectId,
          data: {
            ...this.jobs[objectId],
            ingest: {
              ...this.jobs[objectId].ingest,
              runState: "failed"
            }
          }
        });

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
        this.UpdateIngestObject({
          id: objectId,
          data: {
            ...this.jobs[objectId],
            ingest: {
              ...this.jobs[objectId].ingest,
              runState: "failed"
            }
          }
        });

        console.error("Generated profile returned error.", generatedProfile);
        this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
        return;
      }

      return {
        abrProfile: generatedProfile.result,
        contentTypeId: abr.mez_content_type
      };
    } catch(error) {
      this.UpdateIngestObject({
        id: objectId,
        data: {
          ...this.jobs[objectId],
          ingest: {
            ...this.jobs[objectId].ingest,
            runState: "failed"
          }
        }
      });

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
            runState: "finished",
            mezzanineHash: finalizeAbrResponse.hash,
            objectId: finalizeAbrResponse.id
          }
        }
      });
    } catch(error) {
      this.UpdateIngestObject({
        id: objectId,
        data: {
          ...this.jobs[objectId],
          finalize: {
            ...this.jobs[objectId].finalize,
            runState: "failed"
          }
        }
      });

      console.error("Unable to finalize mezzanine object");
      console.error(error);
      this.UpdateIngestErrors("errors", "Error: Unable to transcode selected file.");
    }
  });
}

export default IngestStore;
