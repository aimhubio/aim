import React from 'react';
import {
  Box,
  TextField,
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
import Button from 'components/Button/Button';

import useModel from 'hooks/model/useModel';
import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import projectsModel from 'services/models/projects/projectsModel';
import COLORS from 'config/colors/colors';
import getObjectPaths from 'utils/getObjectPaths';
import {
  ISelectFormProps,
  ISelectParamsOption,
} from 'types/pages/params/components/SelectForm/SelectForm';
import paramsAppModel from 'services/models/params/paramsAppModel';
import Icon from 'components/Icon/Icon';
import SelectTag from 'components/SelectTag/SelectTag';

import './SelectForm.scss';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';

function SelectForm({
  onParamsSelectChange,
  selectedParamsData,
  onSelectRunQueryChange,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchRef = React.useRef<any>(null);
  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getParamsAndMetrics();
    searchRef.current = paramsAppModel.getParamsData();
    paramsMetricsRequestRef.call();
    return () => {
      paramsMetricsRequestRef.abort();
      searchRef.current.abort();
    };
  }, []);

  function handleParamsSearch() {
    searchRef.current.call();
  }

  function onSelect(event: object, value: any): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectMetricsOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onParamsSelectChange(
      value.filter((option: any) => lookup[option.label] === 0),
    );
  }

  function handleDelete(field: any): void {
    let fieldData = [...selectedParamsData?.params].filter(
      (opt: any) => opt.label !== field,
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

  const paramsOptions: ISelectParamsOption[] = React.useMemo(() => {
    let data: ISelectParamsOption[] = [];
    if (projectsData?.metrics) {
      for (let key in projectsData.metrics) {
        for (let val of projectsData.metrics[key]) {
          let label: string = Object.keys(val)
            .map((item) => `${item}=${val[item]}`)
            .join(', ');
          let index: number = data.length;
          data.push({
            label: `${key} ${label}`,
            group: 'metrics',
            type: 'metrics',
            color: COLORS[0][index % COLORS[0].length],
            value: {
              param_name: key,
              context: val,
            },
          });
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
            <>
              <Box display='flex' alignItems='center'>
                <Button
                  variant='outlined'
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
                    value={selectedParamsData?.params}
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
                      let selected: boolean = !!selectedParamsData?.params.find(
                        (item: ISelectParamsOption) =>
                          item.label === option.label,
                      )?.label;
                      return (
                        <React.Fragment>
                          <Checkbox
                            color='primary'
                            icon={<CheckBoxOutlineBlank />}
                            checkedIcon={<CheckBoxIcon />}
                            checked={selected}
                          />
                          <span className='SelectForm__option__label'>
                            {option.label}
                          </span>
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
                  {selectedParamsData?.params?.map(
                    (tag: ISelectParamsOption) => {
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
                onClick={() => onParamsSelectChange([])}
                className='SelectForm__clearAll'
              >
                <Icon name='close' />
              </span>
            </>
          </Box>
          <Button
            color='primary'
            variant='contained'
            startIcon={<SearchOutlined />}
            className='Params__SelectForm__search__button'
            onClick={handleParamsSearch}
          >
            Search
          </Button>
        </Box>

        <Box mt={0.875}>
          <TextField
            fullWidth
            size='small'
            variant='outlined'
            inputProps={{ style: { height: '0.687rem' } }}
            placeholder='Run expression'
            value={selectedParamsData?.query}
            onChange={({ target }) => onSelectRunQueryChange(target.value)}
          />
        </Box>
      </div>
    </div>
  );
}

export default React.memo(SelectForm);
