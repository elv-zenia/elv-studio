import {Title} from "@mantine/core";

const FormSectionTitle = ({title}) => {
  return (

    <Title
      size="1.5rem"
      fw={500}
      pb={16}
      order={3}
    >
      { title }
    </Title>
  );
};

export default FormSectionTitle;
