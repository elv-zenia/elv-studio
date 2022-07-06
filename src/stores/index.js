import {configure, flow} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  loaded = false;
  client = undefined;
  networkInfo = undefined;

  constructor() {
    // makeObservable(this);

    this.Initialize();
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 240
      });

      this.networkInfo = yield this.client.NetworkInfo();
    } catch(error) {
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });
}

export const rootStore = new RootStore();

window.rootStore = rootStore;
