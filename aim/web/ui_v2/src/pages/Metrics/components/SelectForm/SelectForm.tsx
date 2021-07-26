import React from 'react';
import { Box, Chip, Grid, TextField, Button } from '@material-ui/core';
import MultiSelect from 'components/MultiSelect/MultiSelect';

const options = [
  'best_loss',
  'bleu',
  'bsz',
  'gnorm',
  'loss',
  'loss_scale',
  'lr',
  'nll_loss',
  'ppl',
  'train_wall',
  'ups',
  'wall',
  'wpb',
  'wps',
];
function SelectForm(): React.FunctionComponentElement<React.ReactNode> {
  const [fields, setFields] = React.useState<string[]>(options);
  const [editMode, setEditMode] = React.useState<boolean>(false);

  function onSelect(event: React.ChangeEvent<{ value: unknown }>) {
    setFields(event.target.value as string[]);
  }

  function handleDelete(field: string) {
    let fieldData = [...fields].filter((v) => v !== field);
    setFields(fieldData);
  }

  function resetFields(): void {
    setFields([]);
  }

  function toggleEditMode(): void {
    setEditMode(!editMode);
  }

  return (
    <Grid container direction='column' spacing={1} wrap='nowrap'>
      <Grid item xs={12}>
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
                variant='outlined'
                placeholder='Select statement e.g. select m:Metric if m.name in [“loss”, “accuract”] and m.run.lr > 10 return m'
              />
            </Box>
          ) : (
            <>
              <Box minWidth={130}>
                <MultiSelect
                  id={'SelectMetric'}
                  values={fields}
                  onSelect={onSelect}
                  options={options}
                  renderValue={() => 'Select Metric'}
                  defaultValue='Select Metric'
                />
              </Box>
              <Box flex='1' maxWidth='75%' display='flex' overflow='scroll'>
                {fields.map((field: string) => {
                  return (
                    <Box key={field} mr={1}>
                      <Chip
                        label={field}
                        onDelete={() => handleDelete(field)}
                      />
                    </Box>
                  );
                })}
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
              {editMode ? '!' : ''} E
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
