import {configure, makeObservable, observable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import IngestStore from "./IngestStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  loaded = false;
  client = undefined;
  networkInfo = undefined;
  libraries = undefined;

  constructor() {
    makeObservable(this, {
      libraries: observable
    });

    this.Initialize();
    this.ingestStore = new IngestStore(this);
  }

  get libraries() {
    return this.libraries;
  }

  Initialize = () => {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 240
      });

      // this.networkInfo = yield this.client.NetworkInfo();
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
