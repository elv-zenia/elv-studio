import {flow, makeAutoObservable} from "mobx";
import {ValidateLibrary} from "@eluvio/elv-client-js/src/Validation";
import UrlJoin from "url-join";
import {FileInfo} from "../utils/Files";
import {ParseInputJson} from "../utils/Input";
const ABR = require("@eluvio/elv-abr-profile");
const defaultOptions = require("@eluvio/elv-lro-status/defaultOptions");
const enhanceLROStatus = require("@eluvio/elv-lro-status/enhanceLROStatus");

class IngestStore {
  libraries;
  loaded;
  jobs = {};
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

  GetIngestJob = (jobId) => {
    return this.jobs[jobId];
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
    console.log("jobs", this.jobs);
  }

  UpdateIngestErrors = (type, message) => {
    this.ingestErrors[type].push(message);
  }

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

  GenerateEmbedUrl = flow (function * ({versionHash, objectId}) {
    const networkInfo = yield this.client.NetworkInfo();
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
                "abr"
              ]
            }));

            this.libraries[libraryId] = {
              libraryId,
              name: response.public && response.public.name || libraryId,
              abr: response.abr
            };
          })
        );
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load libraries");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });

  CreateProductionMaster = flow(function * ({
    libraryId,
    abr,
    files,
    title,
    playbackEncryption="both",
    description,
    CreateCallback
  }) {
    ValidateLibrary(libraryId);

    // Add ABR metadata to library if form changes were made
    if(abr) {
      const libraryObjectId = libraryId.replace("ilib", "iq__");
      abr = ParseInputJson(abr);

      yield this.client.EditAndFinalizeContentObject({
        libraryId,
        objectId: libraryObjectId,
        commitMessage: "Updated abr profile",
        callback: async ({writeToken}) => {
          await this.client.ReplaceMetadata({
            libraryId,
            objectId: libraryObjectId,
            writeToken,
            metadataSubtree: "abr",
            metadata: abr
          });
        }
      });
    }

    const {qid} = yield this.client.ContentLibrary({libraryId});
    const abrResponse = yield this.client.ContentObjectMetadata({
      libraryId: yield this.client.ContentObjectLibraryId({objectId: qid}),
      objectId: qid,
      metadataSubtree: "/abr"
    });
    abr = abrResponse;

    if(!abr) { throw Error(`Library ${libraryId} is not set up for ingest.`); }

    const fileInfo = yield FileInfo("", files);
    let response = yield this.client.CreateContentObject({
      libraryId,
      options: abr.mez_content_type ? { type: abr.mez_content_type } : {}
    });

    const masterObjectId = response.id;

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {currentStep: "upload"}
    });

    if(CreateCallback && typeof CreateCallback === "function") CreateCallback(masterObjectId);

    // Create encryption conk
    yield this.client.CreateEncryptionConk({
      libraryId,
      objectId: masterObjectId,
      writeToken: response.write_token,
      createKMSConk: true
    });

    // Upload files
    yield this.client.UploadFiles({
      libraryId,
      objectId: masterObjectId,
      writeToken: response.write_token,
      fileInfo,
      callback: (progress) => {
        let uploadSum = 0;
        let totalSum = 0;
        Object.values(progress).forEach(fileProgress => {
          uploadSum += fileProgress.uploaded;
          totalSum += fileProgress.total;
        });

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            upload: {
              percentage: Math.round((uploadSum / totalSum) * 100)
            }
          }
        });
      },
      encryption: ["both", "drm"].includes(playbackEncryption) ? "cgck" : "none"
    });

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        upload: {
          ...this.jobs[masterObjectId].upload,
          complete: true,
        },
        currentStep: "ingest"
      }
    });

    // Bitcode method
    const {errors} = yield this.client.CallBitcodeMethod({
      libraryId,
      objectId: masterObjectId,
      writeToken: response.write_token,
      method: UrlJoin("media", "production_master", "init"),
      body: {
        access: []
      },
      constant: false
    });

    if(errors) {
      /* eslint-disable no-console */
      console.error(errors);
      this.UpdateIngestErrors("errors", "Error: Unable to ingest selected media file.");
    }

    // Check if audio and video streams
    const streams = (yield this.client.ContentObjectMetadata({
      libraryId,
      objectId: masterObjectId,
      writeToken: response.write_token,
      metadataSubtree: UrlJoin("production_master", "variants", "default", "streams")
    }));

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
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
      writeToken: response.write_token,
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
      writeToken: response.write_token,
      abr
    });

    // Update name to remove [ingest: uploading]
    yield this.client.MergeMetadata({
      libraryId,
      objectId: masterObjectId,
      writeToken: response.write_token,
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
      writeToken: response.write_token,
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
        this.UpdateIngestErrors("errors", "Error: ABR Profile has no relevant playout formats.");
      }
    }

    return Object.assign(
      finalizeResponse, {
        abrProfile,
        contentTypeId
      }
    );
  });

  Test = flow(function *({libraryId, objectId, metadataSubtree}) {
    return yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree
    });
  })

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
    offeringKey="default"
  }) {
    try {
      const createResponse = yield this.client.CreateABRMezzanine({
        libraryId,
        objectId: newObject ? undefined : masterObjectId,
        type,
        name: `${name} [ingest: transcoding] MEZ`,
        masterVersionHash,
        abrProfile,
        variant,
        offeringKey
      });
      const objectId = createResponse.id;

      yield this.WaitForPublish({
        hash: createResponse.hash,
        libraryId,
        objectId
      });

      const { writeToken, hash } = yield this.client.StartABRMezzanineJobs({
        libraryId,
        objectId
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
          /* eslint-disable no-console */
          console.error("Received no job status information from server - object already finalized?");
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
            /* eslint-disable no-console */
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
              mezObjectId: objectId,
              ingest: {
                runState: run_state,
                estimatedTimeLeft:
                !estimated_time_left_seconds ? "Calculating..." : estimated_time_left_h_m_s
              }
            }
          });

          if(run_state !== "running") {
            clearInterval(statusIntervalId);
            done = true;

            const embedUrl = await this.GenerateEmbedUrl({
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
    } catch(error) {
      console.error(`Failed to create mezzanine object: ${masterObjectId}`);
      console.error(error);
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
        this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
        return;
      }

      const generatedProfile = ABR.ABRProfileForVariant(
        production_master.sources,
        production_master.variants.default,
        abr.default_profile
      );

      if(!generatedProfile.ok) {
        this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
        return;
      }

      return {
        abrProfile: generatedProfile.result,
        contentTypeId: abr.mez_content_type
      };
    } catch(error) {
      /* eslint-disable no-console */
      console.error(`Failed to create ABR ladder for object: ${objectId}`);
      console.error(error);
      this.UpdateIngestErrors("errors", "Error: Unable to create ABR profile.");
    }
  });

  FinalizeABRMezzanine = flow(function * ({libraryId, objectId, masterObjectId}) {
    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
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
          finalize: {
            mezzanineHash: finalizeAbrResponse.hash,
            objectId: finalizeAbrResponse.id
          }
        }
      });
    } catch(error) {
      /* eslint-disable no-console */
      console.error(error);
      this.UpdateIngestErrors("errors", "Error: Unable to transcode selected file.");
    }
  });
}

export default IngestStore;
