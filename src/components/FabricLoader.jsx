import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {PageLoader} from "@/components/common/Loader";
import {ingestStore} from "@/stores";

const FabricLoader = observer(({children}) => {
  const LoadDependencies = async () => {
    await ingestStore.LoadDependencies();
  };

  useEffect(() => {
    LoadDependencies();
  }, []);

  if(!ingestStore.loaded) {
    return <PageLoader />;
  } else {
    return children;
  }
});

export default FabricLoader;
