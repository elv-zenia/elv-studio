import {configure, flow, makeObservable, observable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import IngestStore from "@/stores/IngestStore";
import TenantStore from "@/stores/TenantStore.js";

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
    this.tenantStore = new TenantStore(this);
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 60
      });
      window.client = this.client;

      this.networkInfo = yield this.client.NetworkInfo();
    } catch(error) {
      /* eslint-disable no-console */
      console.error("Failed to initialize application");
      console.error(error);
      /* eslint-enable no-console */
    } finally {
      this.loaded = true;
    }
  });

  Decode = (string) => {
    try {
      return this.client.utils.FromB64(string);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to decode ${string}.`, error);
    }
  };

  DecodeVersionHash = ({versionHash}) => {
    return this.client.utils.DecodeVersionHash(versionHash);
  };
}

export const rootStore = new RootStore();
export const ingestStore = rootStore.ingestStore;
export const tenantStore = rootStore.tenantStore;

window.rootStore = rootStore;
