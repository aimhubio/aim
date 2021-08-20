import React from 'react';
import {
  Box,
  Chip,
  TextField,
  Button,
  Checkbox,
  Divider,
  InputBase,
  Popper,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
  SearchOutlined,
} from '@material-ui/icons';
import useModel from 'hooks/model/useModel';
import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import projectsModel from 'services/models/projects/projectsModel';
import COLORS from 'config/colors/colors';

import resetImg from 'assets/icons/reset.svg';
import visibleImg from 'assets/icons/visible.svg';
import editImg from 'assets/icons/edit.svg';
import {
  ISelectMetricsOption,
  ISelectFormProps,
} from 'types/pages/metrics/components/SelectForm/SelectForm';
import metricAppModel from 'services/models/metrics/metricsAppModel';

import './SelectForm.scss';

function SelectForm({
  onMetricsSelectChange,
  selectedMetricsData,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchMetricsRef = React.useRef<any>(null);

  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getParamsAndMetrics();
    searchMetricsRef.current = metricAppModel.getMetricsData();

    paramsMetricsRequestRef.call();
    return () => {
      paramsMetricsRequestRef.abort();
      searchMetricsRef.current.abort();
    };
  }, []);

  function handleMetricSearch() {
    searchMetricsRef.current.call();
  }

  function onSelect(event: object, value: any): void {
    onMetricsSelectChange(value);
  }

  function handleDelete(field: any): void {
    let fieldData = [...selectedMetricsData].filter(
      (opt: any) => opt.name !== field,
    );
    onMetricsSelectChange(fieldData);
  }

  function toggleEditMode(): void {
    setEditMode(!editMode);
  }

  function handleClick(event: React.ChangeEvent<any>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(event: any, reason: any) {
    if (reason === 'toggleInput') {
      return;
    }
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  }

  const metricsOptions: ISelectMetricsOption[] = React.useMemo(() => {
    let data: ISelectMetricsOption[] = [];
    if (projectsData?.metrics) {
      for (let key in projectsData.metrics) {
        for (let val of projectsData.metrics[key]) {
          let name: string = Object.keys(val)
            .map((item) => `${item}="${val[item]}"`)
            .join(', ');
          let index: number = data.length;
          data.push({
            name: `${key} ${name}`,
            group: 'metrics',
            color: COLORS[0][index % COLORS[0].length],
          });
        }
      }
    }
    return data;
  }, [projectsData]);

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;
  return (
    <div className='SelectForm__container'>
      <div className='SelectForm__metrics__container'>
        <Box display='flex'>
          <Box
            width='100%'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            {editMode ? (
              <Box flex={1} flexWrap='nowrap'>
                <TextField
                  fullWidth
                  multiline
                  size='small'
                  rows={3}
                  variant='outlined'
                  placeholder='Select statement e.g. select m:Metric if m.name in [“loss”, “accuract”] and m.run.lr > 10 return m'
                />
              </Box>
            ) : (
              <>
                <Box display='flex' alignItems='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleClick}
                    aria-describedby={id}
                  >
                    + Metrics
                  </Button>
                  <Popper
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    placement='bottom-start'
                    className='SelectForm__Popper'
                  >
                    <Autocomplete
                      open
                      onClose={handleClose}
                      multiple
                      size='small'
                      disablePortal
                      disableCloseOnSelect
                      options={metricsOptions}
                      value={selectedMetricsData}
                      onChange={onSelect}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option.name}
                      renderTags={() => null}
                      disableClearable={true}
                      ListboxProps={{
                        style: {
                          height: 400,
                        },
                      }}
                      renderInput={(params) => (
                        <InputBase
                          ref={params.InputProps.ref}
                          inputProps={params.inputProps}
                          autoFocus={true}
                          className='SelectForm__metric__select'
                        />
                      )}
                      renderOption={(option) => {
                        let selected: boolean = !!selectedMetricsData.find(
                          (item: ISelectMetricsOption) =>
                            item.name === option.name,
                        )?.name;
                        return (
                          <React.Fragment>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank />}
                              checkedIcon={<CheckBoxIcon />}
                              style={{ marginRight: 4 }}
                              checked={selected}
                            />
                            {option.name}
                          </React.Fragment>
                        );
                      }}
                    />
                  </Popper>
                  <Divider
                    style={{ margin: '0 1em' }}
                    orientation='vertical'
                    flexItem
                  />
                  <Box className='SelectForm__tags'>
                    {selectedMetricsData?.map((tag: ISelectMetricsOption) => {
                      return (
                        <Chip
                          key={tag.name}
                          style={{
                            backgroundColor: `${tag.color}1a`,
                            color: tag.color,
                          }}
                          size='small'
                          className='SelectForm__tags__item'
                          label={tag.name}
                          data-name={tag.name}
                          deleteIcon={
                            <i
                              style={{
                                color: tag.color,
                              }}
                              className='icon-delete'
                            />
                          }
                          onDelete={() => handleDelete(tag.name)}
                        />
                      );
                    })}
                  </Box>
                </Box>
                <span
                  onClick={() => onMetricsSelectChange([])}
                  className='SelectForm__clearAll'
                >
                  <i className='icon-delete' />
                </span>
              </>
            )}
          </Box>
        </Box>
        {editMode ? null : (
          <Box mt={0.875}>
            <TextField
              fullWidth
              size='small'
              variant='outlined'
              placeholder='Run expression'
            />
          </Box>
        )}
      </div>
      <Divider style={{ margin: '0 1.5em' }} orientation='vertical' flexItem />
      <div className='SelectForm__search__container'>
        <Button
          color='primary'
          variant='contained'
          startIcon={<SearchOutlined />}
          className='SelectForm__search__button'
          onClick={handleMetricSearch}
        >
          Search
        </Button>
        <div className='SelectForm__search__actions'>
          <span>
            <img src={resetImg} alt='reset' />
          </span>
          <span onClick={toggleEditMode}>
            <img src={editImg} alt='edit' />
          </span>
          <span>
            <img src={visibleImg} alt='visible' />
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SelectForm);
