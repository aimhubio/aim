import React from 'react';
import {
  Box,
  Chip,
  Grid,
  TextField,
  Button,
  Checkbox,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import styles from './selectFormStyle.module.scss';
import { metricOptions } from 'utils/mockOptions';

function SelectForm(): React.FunctionComponentElement<React.ReactNode> {
  const [fields, setFields] = React.useState<any>([]);
  const [editMode, setEditMode] = React.useState<boolean>(false);

  function onSelect(event: object, value: any, reason: string): void {
    setFields([...value]);
  }

  function handleDelete(field: any): void {
    let fieldData = [...fields].filter((opt: any) => opt.name !== field);
    setFields(fieldData);
  }

  function toggleEditMode(): void {
    setEditMode(!editMode);
  }

  return (
    <Grid
      container
      direction='column'
      spacing={1}
      wrap='nowrap'
      className={styles.selectForm}
    >
      <Grid className={styles.flex} item xs={12}>
        <Box
          width='100%'
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          {editMode ? (
            <Box flex={1} flexWrap='nowrap' mr={1}>
              <TextField
                fullWidth
                multiline
                size='small'
                rows={4}
                variant='outlined'
                placeholder='Select statement e.g. select m:Metric if m.name in [“loss”, “accuract”] and m.run.lr > 10 return m'
              />
            </Box>
          ) : (
            <Box width='100%' mr={2}>
              <Autocomplete
                id='select-metrics'
                size='small'
                multiple
                disableCloseOnSelect
                options={metricOptions}
                value={fields}
                onChange={onSelect}
                groupBy={(option) => option.group}
                getOptionLabel={(option) => option.name}
                renderTags={() => {
                  return (
                    <Box className={styles.selectForm__tags}>
                      {fields.map((tag: any) => {
                        return (
                          <Box component='span' key={tag.name} mr={1}>
                            <Chip
                              size='small'
                              label={tag.name}
                              data-name={tag.name}
                              onDelete={() => handleDelete(tag.name)}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    label='Select Metrics'
                    placeholder='Select'
                  />
                )}
                renderOption={(option, { selected }) => (
                  <React.Fragment>
                    <Checkbox
                      icon={<CheckBoxOutlineBlank />}
                      checkedIcon={<CheckBoxIcon />}
                      style={{ marginRight: 4 }}
                      checked={selected}
                    />
                    {option.name}
                  </React.Fragment>
                )}
              />
            </Box>
          )}
          <Button variant='outlined' onClick={toggleEditMode}>
            {editMode ? '!' : ''}E
          </Button>
        </Box>
      </Grid>
      {editMode ? null : (
        <Grid item xs={12}>
          <TextField
            fullWidth
            size='small'
            variant='outlined'
            placeholder='Run expression'
          />
        </Grid>
      )}
    </Grid>
  );
}

export default React.memo(SelectForm);
