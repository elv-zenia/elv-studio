import {configure, flow, makeObservable, observable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import IngestStore from "Stores/IngestStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  loaded = false;
  client;
  networkInfo;

  constructor() {
    makeObservable(this, {
      client: observable,
      loaded: observable,
      networkInfo: observable
    });

    this.Initialize();
    this.ingestStore = new IngestStore(this);
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 60
      });

      this.networkInfo = yield this.client.NetworkInfo();
    } catch(error) {
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });
}

export const rootStore = new RootStore();
export const ingestStore = rootStore.ingestStore;

window.rootStore = rootStore;
