// Class that handles main visual treatments
import {makeAutoObservable} from "mobx";

class UiStore {
  rootStore;
  theme = "light";
  errorMessage;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  SetTheme = ({theme}) => {
    this.theme = theme;
  };

  SetErrorMessage(message) {
    this.errorMessage = message;
  }
}

export default UiStore;
