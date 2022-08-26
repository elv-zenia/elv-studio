import {flow, makeAutoObservable} from "mobx";

class IngestStore {
  libraries;
  loaded;

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

  LoadLibraries = flow(function * () {
    try {
      if(!this.libraries) {
        this.libraries = {};

        const libraryIds = yield this.client.ContentLibraries();
        yield Promise.all(
          libraryIds.map(async libraryId => {
            const name = (await this.client.ContentObjectMetadata({
              libraryId,
              objectId: libraryId.replace(/^ilib/, "iq__"),
              metadataSubtree: "public/name"
            })) || libraryId;

            this.libraries[libraryId] = {
              libraryId,
              name
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
}

export default IngestStore;
