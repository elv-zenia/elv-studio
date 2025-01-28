import {Alert, Box, Button, Flex, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";
import {useEffect, useRef} from "react";

const AlertMessage = ({error}) => {
  const errorRef = useRef(null);

  useEffect(() => {
    if(errorRef && errorRef.current) {
      errorRef.current.scrollIntoView();
    }
  }, [error]);

  if(!error) { return null; }

  const {title, message} = error;

  return (
    <Box ref={errorRef} mb={16}>
      <Alert
        variant="light"
        color="elv-red.4"
        title={title}
        withCloseButton
      >
        { message }
      </Alert>
    </Box>
  );
};

const TopActions = ({actions=[]}) => {
  if(actions.length === 0) { return null; }

  return (
    <Flex direction="row" align="center" justify="space-between" mb={32}>
      {
        actions.length > 0 ?
          (
            <Flex direction="row" gap="sm">
              {
                actions.map(({label, variant="filled", onClick, disabled, leftSection}) => (
                  <Button
                    onClick={onClick}
                    key={`top-action-${label}`}
                    disabled={disabled}
                    leftSection={leftSection}
                    variant={variant}
                  >
                    { label ? label : null }
                  </Button>
                ))
              }
            </Flex>
          ) : null
      }
    </Flex>
  );
};

const PageContainer = ({
  title,
  children,
  centerTitle=false,
  width="100%",
  error,
  actions
}) => {
  return (
    <Box w={width}>
      <Box p="24 46 46">
        <AlertMessage error={error} />
        <TopActions actions={actions} />
        {
          title &&
          <Flex justify={centerTitle ? "center" : "flex-start"}>
            <Title order={3} classNames={{root: styles.root}} mb={24}>
              { title }
            </Title>
          </Flex>
        }
        { children }
      </Box>
    </Box>
  );
};

export default PageContainer;
