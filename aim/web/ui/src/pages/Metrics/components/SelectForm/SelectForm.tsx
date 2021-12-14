import React from 'react';
import { isEmpty } from 'lodash-es';

import {
  Box,
  Checkbox,
  Divider,
  InputBase,
  Popper,
  Tooltip,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Button, Icon, Badge, Text } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete/ExpressionAutoComplete';

import COLORS from 'config/colors/colors';

import useModel from 'hooks/model/useModel';
import useParamsSuggestions from 'hooks/projectData/useParamsSuggestions';

import projectsModel from 'services/models/projects/projectsModel';
import metricAppModel from 'services/models/metrics/metricsAppModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import { ISelectFormProps } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import contextToString from 'utils/contextToString';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  selectedMetricsData,
  onMetricsSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onSearchQueryCopy,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchRef = React.useRef<any>(null);
  const paramsSuggestions = useParamsSuggestions();

  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getProjectParams(['metric']);
    paramsMetricsRequestRef.call();
    return () => {
      paramsMetricsRequestRef?.abort();
      searchRef.current?.abort();
    };
  }, []);

  function handleMetricSearch(e: React.ChangeEvent<any>): void {
    e.preventDefault();
    if (requestIsPending) {
      return;
    }
    searchRef.current = metricAppModel.getMetricsData(true);
    searchRef.current.call();
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchRef.current?.abort();
    metricAppModel.abortRequest();
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onMetricsSelectChange(value.filter((option) => lookup[option.label] === 0));
  }

  function handleDelete(field: string): void {
    let fieldData = [...(selectedMetricsData?.options || [])].filter(
      (opt: ISelectOption) => opt.label !== field,
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

  const metricsOptions: ISelectOption[] = React.useMemo(() => {
    let data: ISelectOption[] = [];
    const systemOptions: ISelectOption[] = [];
    let index: number = 0;
    if (projectsData?.metrics) {
      for (let key in projectsData?.metrics) {
        let system: boolean = isSystemMetric(key);
        let option = getOption(system, key, index);
        if (system) {
          systemOptions.push(option);
        } else {
          data.push(option);
        }
        index++;
        for (let val of projectsData?.metrics[key]) {
          if (!isEmpty(val)) {
            let label = contextToString(val);
            let option = getOption(system, key, index, val);
            option.label = `${option.label} ${label}`;
            if (system) {
              systemOptions.push(option);
            } else {
              data.push(option);
            }
            index++;
          }
        }
      }
    }
    return data.concat(systemOptions);
  }, [projectsData]);

  function getOption(
    system: boolean,
    key: string,
    index: number,
    val: object | null = null,
  ): ISelectOption {
    return {
      label: `${system ? formatSystemMetricName(key) : key}`,
      group: system ? formatSystemMetricName(key) : key,
      color: COLORS[0][index % COLORS[0].length],
      value: {
        option_name: key,
        context: val,
      },
    };
  }

  function handleResetSelectForm(): void {
    onMetricsSelectChange([]);
    onSelectRunQueryChange('');
  }

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;

  return (
    <div className='Metrics__SelectForm'>
      <div className='Metrics__SelectForm__container__metrics'>
        <Box
          width='100%'
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          {selectedMetricsData?.advancedMode ? (
            <div className='Metrics__SelectForm__textarea'>
              <ExpressionAutoComplete
                isTextArea={true}
                onExpressionChange={onSelectAdvancedQueryChange}
                onSubmit={handleMetricSearch}
                value={selectedMetricsData?.advancedQuery}
                placeholder='metric.name in [“loss”, “accuracy”] and run.learning_rate > 10'
                options={[
                  'metric.name',
                  'metric.context',
                  ...paramsSuggestions,
                ]}
              />
            </div>
          ) : (
            <>
              <Box display='flex' alignItems='center'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleClick}
                  aria-describedby={id}
                >
                  <Icon name='plus' style={{ marginRight: '0.5rem' }} />
                  Metrics
                </Button>
                <Popper
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  placement='bottom-start'
                  className='Metrics__SelectForm__Popper'
                >
                  <Autocomplete
                    open
                    onClose={handleClose}
                    multiple
                    className='Autocomplete__container'
                    size='small'
                    disablePortal={true}
                    disableCloseOnSelect
                    options={metricsOptions}
                    value={selectedMetricsData?.options}
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
                        spellCheck={false}
                        placeholder='Search'
                        autoFocus={true}
                        className='Metrics__SelectForm__metric__select'
                      />
                    )}
                    renderOption={(option) => {
                      let selected: boolean =
                        !!selectedMetricsData?.options.find(
                          (item: ISelectOption) => item.label === option.label,
                        )?.label;
                      return (
                        <React.Fragment>
                          <Checkbox
                            color='primary'
                            icon={<CheckBoxOutlineBlank />}
                            checkedIcon={<CheckBoxIcon />}
                            checked={selected}
                            size='small'
                          />
                          <Text className='SelectForm__option__label' size={14}>
                            {option.label}
                          </Text>
                        </React.Fragment>
                      );
                    }}
                  />
                </Popper>
                <Divider
                  style={{ margin: '0 1rem' }}
                  orientation='vertical'
                  flexItem
                />
                {selectedMetricsData?.options.length === 0 && (
                  <Text tint={50} size={14} weight={400}>
                    No metrics are selected
                  </Text>
                )}
                <div className='Metrics__SelectForm__tags ScrollBar__hidden'>
                  {selectedMetricsData?.options?.map((tag: ISelectOption) => {
                    return (
                      <Badge
                        size='large'
                        key={tag.label}
                        color={tag.color}
                        label={tag.label}
                        onDelete={handleDelete}
                      />
                    );
                  })}
                </div>
              </Box>
              {selectedMetricsData?.options &&
                selectedMetricsData.options.length > 1 && (
                  <span
                    onClick={() => onMetricsSelectChange([])}
                    className='Metrics__SelectForm__clearAll'
                  >
                    <Icon name='close' />
                  </span>
                )}
            </>
          )}
        </Box>
        {selectedMetricsData?.advancedMode ? null : (
          <div className='Metrics__SelectForm__TextField'>
            <ExpressionAutoComplete
              onExpressionChange={onSelectRunQueryChange}
              onSubmit={handleMetricSearch}
              value={selectedMetricsData?.query}
              options={paramsSuggestions}
              placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
            />
          </div>
        )}
      </div>
      <div className='Metrics__SelectForm__container__search'>
        <Button
          fullWidth
          color='primary'
          variant={requestIsPending ? 'outlined' : 'contained'}
          startIcon={
            <Icon
              name={requestIsPending ? 'close' : 'search'}
              fontSize={requestIsPending ? 12 : 14}
            />
          }
          className='Metrics__SelectForm__search__button'
          onClick={requestIsPending ? handleRequestAbort : handleMetricSearch}
        >
          {requestIsPending ? 'Cancel' : 'Search'}
        </Button>
        <div className='Metrics__SelectForm__search__actions'>
          <Tooltip title='Reset query'>
            <div>
              <Button onClick={handleResetSelectForm} withOnlyIcon={true}>
                <Icon name='reset' />
              </Button>
            </div>
          </Tooltip>
          <Tooltip
            title={
              selectedMetricsData?.advancedMode
                ? 'Switch to default mode'
                : 'Enable advanced search mode '
            }
          >
            <div>
              <Button
                className={selectedMetricsData?.advancedMode ? 'active' : ''}
                withOnlyIcon={true}
                onClick={toggleEditMode}
              >
                <Icon name='edit' />
              </Button>
            </div>
          </Tooltip>
          <Tooltip title='Copy search query'>
            <div>
              <Button onClick={onSearchQueryCopy} withOnlyIcon={true}>
                <Icon name='copy' />
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SelectForm);
