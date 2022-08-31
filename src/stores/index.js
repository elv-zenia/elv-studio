import {configure, makeObservable, observable} from "mobx";
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
      // networkInfo: observable,
      client: observable,
      loaded: observable
    });

    this.Initialize();
    this.ingestStore = new IngestStore(this);
  }

  Initialize = () => {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 60
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize application");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loaded = true;
    }
  };
}

export const rootStore = new RootStore();
export const ingestStore = rootStore.ingestStore;

window.rootStore = rootStore;
