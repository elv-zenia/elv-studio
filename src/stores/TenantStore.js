import {flow, makeAutoObservable} from "mobx";

class TenantStore {
  tenantId;
  titleContentType;
  loaded = false;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

    this.LoadTenantData();
  }

  get client() {
    return this.rootStore.client;
  }

  LoadTenantData = flow(function * () {
    try {
      if(!this.tenantId) {
        this.tenantId = yield this.client.userProfileClient.TenantContractId();

        if(!this.tenantId) {
          throw "Tenant ID not found";
        }
      }

      const response = yield this.client.ContentObjectMetadata({
        libraryId: this.tenantId.replace("iten", "ilib"),
        objectId: this.tenantId.replace("iten", "iq__"),
        metadataSubtree: "public/content_types/title",
      });

      if(response) {
        this.titleContentType = response;
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });
}

export default TenantStore;
