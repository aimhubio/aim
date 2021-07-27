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

import styles from './selectFormStyle.module.css';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

const selectOptions = [
  { name: 'bleu', group: 'metric' },
  { name: 'best_loss', group: 'metric' },
  { name: 'bsz', group: 'metric' },
  { name: 'gnorm', group: 'metric' },
  { name: 'loss', group: 'metric' },
  { name: 'loss_scale', group: 'metric' },
  { name: 'lr', group: 'metric' },
  { name: 'nll_loss', group: 'metric' },
  { name: 'ppl', group: 'metric' },
  { name: 'train_wall', group: 'metric' },
  { name: 'ups', group: 'metric' },
  { name: 'wall', group: 'metric' },
  { name: 'wpb', group: 'metric' },
  { name: 'wps', group: 'metric' },
  { name: 'label_smoothing', group: 'hparams' },
  { name: 'learning_rate', group: 'hparams' },
  { name: 'max_k', group: 'hparams' },
  { name: 'max_tokens', group: 'hparams' },
  { name: 'method', group: 'hparams' },
  { name: 'normalize', group: 'hparams' },
  { name: 'pooling', group: 'hparams' },
  { name: 'seed', group: 'hparams' },
  { name: 'seg', group: 'hparams' },
  { name: 'upscale_primary', group: 'hparams' },
  { name: 'warmup_steps', group: 'hparams' },
];

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

  function resetFields(): void {
    setFields([]);
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
          flexWrap='wrap'
          justifyContent='space-between'
          alignItems='center'
        >
          {editMode ? (
            <Box flex={1} mr={2}>
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
            <>
              <Box width='100%' maxWidth='94em'>
                <Autocomplete
                  id='select-metrics'
                  size='small'
                  multiple
                  disableCloseOnSelect
                  limitTags={6}
                  options={selectOptions}
                  value={fields}
                  onChange={onSelect}
                  groupBy={(option) => option.group}
                  getOptionLabel={(option) => option.name}
                  renderTags={(tags) => {
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
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </React.Fragment>
                  )}
                />
              </Box>
            </>
          )}
          <Box minWidth={140} display='flex'>
            <Button
              style={{ marginRight: 10 }}
              variant='outlined'
              onClick={resetFields}
            >
              X
            </Button>
            <Button variant='outlined' onClick={toggleEditMode}>
              {editMode ? '!' : ''}E
            </Button>
          </Box>
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
