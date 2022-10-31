import {flow, makeAutoObservable} from "mobx";
import Dexie from "dexie";

class FileStore {
  database;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.InitializeIndexedDb();
  }

  InitializeIndexedDb = () => {
    this.database = new Dexie("UploadsDatabase");
    this.database.version(1).stores({FileStore: "jobId"});
  };

  GetFile = flow(function * ({jobId}) {
    const fileObject = yield this.database.FileStore.get(jobId);
    return fileObject.file ? [fileObject.file] : [];
  });

  PersistFile = flow(function * ({file}) {
    yield this.database.FileStore.put(file);
  });

  RemoveFile = flow(function * ({jobId}) {
    yield this.database.FileStore.delete(jobId);
  });

  ClearAllFiles = flow(function * () {
    yield this.database.FileStore.clear();
  });
}

export default FileStore;
