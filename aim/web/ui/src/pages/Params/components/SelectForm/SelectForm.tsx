import React from 'react';

import { Box, Checkbox, Divider, InputBase, Popper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, Button, Icon, Text } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete';

import COLORS from 'config/colors/colors';

import useModel from 'hooks/model/useModel';
import useParamsSuggestions from 'hooks/projectData/useParamsSuggestions';

import projectsModel from 'services/models/projects/projectsModel';
import paramsAppModel from 'services/models/params/paramsAppModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import { ISelectFormProps } from 'types/pages/params/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import getObjectPaths from 'utils/getObjectPaths';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';
import contextToString from 'utils/contextToString';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  onParamsSelectChange,
  selectedParamsData,
  onSelectRunQueryChange,
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

  function handleParamsSearch(e: React.ChangeEvent<any>) {
    e.preventDefault();
    if (requestIsPending) {
      return;
    }
    searchRef.current = paramsAppModel.getParamsData(true);
    searchRef.current.call();
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchRef.current?.abort();
    paramsAppModel.abortRequest();
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onParamsSelectChange(
      value.filter((option: ISelectOption) => lookup[option.label] === 0),
    );
  }

  function handleDelete(field: string): void {
    let fieldData = [...(selectedParamsData?.options || [])].filter(
      (opt: ISelectOption) => opt.label !== field,
    );
    onParamsSelectChange(fieldData);
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

  const paramsOptions: ISelectOption[] = React.useMemo(() => {
    let data: ISelectOption[] = [];
    const systemOptions: ISelectOption[] = [];
    if (projectsData?.metrics) {
      for (let key in projectsData.metrics) {
        let system: boolean = isSystemMetric(key);
        for (let val of projectsData.metrics[key]) {
          let label = contextToString(val);
          let index: number = data.length;
          let option: ISelectOption = {
            label: `${system ? formatSystemMetricName(key) : key} ${label}`,
            group: system ? formatSystemMetricName(key) : key,
            type: 'metrics',
            color: COLORS[0][index % COLORS[0].length],
            value: {
              option_name: key,
              context: val,
            },
          };
          if (system) {
            systemOptions.push(option);
          } else {
            data.push(option);
          }
        }
      }
    }
    if (projectsData?.params) {
      const paramPaths = getObjectPaths(
        projectsData.params,
        projectsData.params,
      );
      paramPaths.forEach((paramPath, index) => {
        data.push({
          label: paramPath,
          group: 'Params',
          type: 'params',
          color: COLORS[0][index % COLORS[0].length],
        });
      });
    }
    return data.concat(systemOptions);
  }, [projectsData]);

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;

  return (
    <div className='SelectForm__container'>
      <div className='SelectForm__params__container'>
        <Box display='flex'>
          <Box
            width='100%'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <>
              <Box display='flex' alignItems='center'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleClick}
                  aria-describedby={id}
                >
                  <Icon name='plus' style={{ marginRight: '0.5rem' }} /> Params
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
                    options={paramsOptions}
                    value={selectedParamsData?.options}
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
                        spellCheck={false}
                        className='SelectForm__param__select'
                      />
                    )}
                    renderOption={(option) => {
                      let selected: boolean =
                        !!selectedParamsData?.options.find(
                          (item: ISelectOption) => item.label === option.label,
                        )?.label;
                      return (
                        <React.Fragment>
                          <Checkbox
                            color='primary'
                            icon={<CheckBoxOutlineBlank />}
                            checkedIcon={<CheckBoxIcon />}
                            checked={selected}
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
                  style={{ margin: '0 1em' }}
                  orientation='vertical'
                  flexItem
                />
                {selectedParamsData?.options.length === 0 && (
                  <Text tint={50} size={14} weight={400}>
                    No params are selected
                  </Text>
                )}
                {selectedParamsData?.options &&
                  selectedParamsData.options.length > 0 && (
                    <Box className='SelectForm__tags ScrollBar__hidden'>
                      {selectedParamsData?.options?.map(
                        (tag: ISelectOption) => {
                          return (
                            <Badge
                              size='large'
                              key={tag.label}
                              color={tag.color}
                              label={tag.label}
                              onDelete={handleDelete}
                            />
                          );
                        },
                      )}
                    </Box>
                  )}
              </Box>
              {selectedParamsData?.options &&
                selectedParamsData.options.length > 1 && (
                  <span
                    onClick={() => onParamsSelectChange([])}
                    className='SelectForm__clearAll'
                  >
                    <Icon name='close' />
                  </span>
                )}
            </>
          </Box>
          <Button
            color='primary'
            variant={requestIsPending ? 'outlined' : 'contained'}
            startIcon={
              <Icon
                name={requestIsPending ? 'close' : 'search'}
                fontSize={requestIsPending ? 12 : 14}
              />
            }
            className='Params__SelectForm__search__button'
            onClick={requestIsPending ? handleRequestAbort : handleParamsSearch}
          >
            {requestIsPending ? 'Cancel' : 'Search'}
          </Button>
        </Box>
        <div className='SelectForm__TextField'>
          <ExpressionAutoComplete
            onExpressionChange={onSelectRunQueryChange}
            onSubmit={handleParamsSearch}
            value={selectedParamsData?.query}
            options={paramsSuggestions}
            placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(SelectForm);
