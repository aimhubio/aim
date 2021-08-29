import React from 'react';
import {
  Box,
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
import SelectTag from 'components/SelectTag/SelectTag';

import './SelectForm.scss';

function SelectForm({
  selectedMetricsData,
  onMetricsSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchMetricsRef = React.useRef<any>(null);

  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getParamsAndMetrics();

    paramsMetricsRequestRef.call();
    return () => {
      paramsMetricsRequestRef?.abort();
      searchMetricsRef.current?.abort();
    };
  }, []);

  function handleMetricSearch() {
    searchMetricsRef.current = metricAppModel.getMetricsData();
    searchMetricsRef.current.call();
  }

  function onSelect(event: object, value: ISelectMetricsOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectMetricsOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onMetricsSelectChange(value.filter((option) => lookup[option.label] === 0));
  }

  function handleDelete(field: string): void {
    let fieldData = [...selectedMetricsData?.metrics].filter(
      (opt: ISelectMetricsOption) => opt.label !== field,
    );
    onMetricsSelectChange(fieldData);
  }

  function toggleEditMode(): void {
    toggleSelectAdvancedMode();
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
    let index: number = 0;
    if (projectsData?.metrics) {
      for (let key in projectsData.metrics) {
        data.push({
          label: key,
          group: key,
          color: COLORS[0][index % COLORS[0].length],
          value: {
            metric_name: key,
            context: null,
          },
        });
        index++;

        for (let val of projectsData.metrics[key]) {
          let label: string = Object.keys(val)
            .map((item) => `${item}="${val[item]}"`)
            .join(', ');
          data.push({
            label: `${key} ${label}`,
            group: key,
            color: COLORS[0][index % COLORS[0].length],
            value: {
              metric_name: key,
              context: val,
            },
          });
          index++;
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
            {selectedMetricsData?.advancedMode ? (
              <Box flex={1} flexWrap='nowrap'>
                <TextField
                  fullWidth
                  multiline
                  size='small'
                  rows={3}
                  variant='outlined'
                  placeholder={
                    'Select statement e.g. select metric:Metric if metric.name in [“loss”, “accuracy”] and metric.run.lr > 10 return metric'
                  }
                  value={selectedMetricsData?.advancedQuery ?? ''}
                  onChange={({ target }) =>
                    onSelectAdvancedQueryChange(target.value)
                  }
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
                      value={selectedMetricsData?.metrics ?? ''}
                      onChange={onSelect}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option.label}
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
                        let selected: boolean =
                          !!selectedMetricsData?.metrics.find(
                            (item: ISelectMetricsOption) =>
                              item.label === option.label,
                          )?.label;
                        return (
                          <React.Fragment>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank />}
                              checkedIcon={<CheckBoxIcon />}
                              style={{ marginRight: 4 }}
                              checked={selected}
                            />
                            {option.label}
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
                  <Box className='SelectForm__tags ScrollBar__hidden'>
                    {selectedMetricsData?.metrics?.map(
                      (tag: ISelectMetricsOption) => {
                        return (
                          <SelectTag
                            key={tag.label}
                            color={tag.color}
                            label={tag.label}
                            onDelete={handleDelete}
                          />
                        );
                      },
                    )}
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
        {selectedMetricsData?.advancedMode ? null : (
          <Box mt={0.875}>
            <TextField
              fullWidth
              size='small'
              variant='outlined'
              placeholder='Run expression'
              value={selectedMetricsData?.query ?? ''}
              onChange={({ target }) => onSelectRunQueryChange(target.value)}
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
