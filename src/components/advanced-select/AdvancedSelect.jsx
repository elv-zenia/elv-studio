import {Combobox, Input, InputBase, Text, Tooltip, useCombobox} from "@mantine/core";

// More complex Select component
// Supports option description
const AdvancedSelect = ({options=[], value, SetValue}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption
  });

  const selectedItem = value ? options.find(option => option.value === value) : null;

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={value => {
        SetValue(value);
        combobox.closeDropdown();
      }}
      mb={16}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
        >
          {
            selectedItem?.label ||
            <Input.Placeholder>Select Encryption</Input.Placeholder>
          }
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown onMouseLeave={() => combobox.resetSelectedOption()}>
        <Combobox.Options>
          {
            options.map(item => (
              <Combobox.Option
                value={item.value}
                key={item.value}
                disabled={item.disabled}
              >
                <Text>{ item.label }</Text>
                <Text fz="xs" c="dimmed">{ item.description }</Text>
              </Combobox.Option>
            ))
          }
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default AdvancedSelect;
