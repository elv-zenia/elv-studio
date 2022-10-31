import {configure, flow, makeObservable, observable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import {ElvWalletClient} from "@eluvio/elv-client-js";
import IngestStore from "Stores/IngestStore";
import FileStore from "Stores/FileStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  loaded = false;
  client;
  walletClient;
  networkInfo;

  constructor() {
    makeObservable(this, {
      client: observable,
      walletClient: observable,
      loaded: observable,
      networkInfo: observable
    });

    this.Initialize();
    this.fileStore = new FileStore(this);
    this.ingestStore = new IngestStore(this);
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 60
      });

      this.networkInfo = yield this.client.NetworkInfo();

      this.walletClient = yield ElvWalletClient.Initialize({
        network: EluvioConfiguration.network,
        mode: EluvioConfiguration.mode
      });
      // this.walletClient.SetProfileMetadata({
      //   type: "user",
      //   mode: "private",
      //   key: "ingest-jobs",
      //   value: JSON.stringify({"test": "abc"})
      // });
    } catch(error) {
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });

  WrapApiCall = flow(function * ({api}) {
    let ok = false;
    let returnVal = null;
    let error = null;
    try {
      returnVal = yield api;
      ok = true;
    } catch(e) {
      error = e;
    }

    return {ok, returnVal, error};
  });
}

export const rootStore = new RootStore();
export const fileStore = rootStore.fileStore;
export const ingestStore = rootStore.ingestStore;

window.rootStore = rootStore;
