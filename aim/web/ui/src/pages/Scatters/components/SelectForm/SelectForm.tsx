import React from 'react';

import { Box, Divider, TextField, Tooltip } from '@material-ui/core';
import { SearchOutlined } from '@material-ui/icons';

import { Button, Icon, Dropdown } from 'components/kit';

import COLORS from 'config/colors/colors';

import useModel from 'hooks/model/useModel';

import projectsModel from 'services/models/projects/projectsModel';
import scattersAppModel from 'services/models/scatters/scattersAppModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';
import { ISelectFormProps } from 'types/pages/scatters/components/SelectForm/SelectForm';

import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';
import getObjectPaths from 'utils/getObjectPaths';

import './SelectForm.scss';

function SelectForm({
  selectedOptionsData,
  onSelectOptionsChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onSearchQueryCopy,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState({
    x: false,
    y: false,
  });

  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const searchRef = React.useRef<any>(null);

  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getProjectParams(['metric']);
    paramsMetricsRequestRef.call();
    return () => {
      paramsMetricsRequestRef?.abort();
      searchRef.current?.abort();
    };
  }, []);

  function handleParamsSearch(e: React.ChangeEvent<any>): void {
    e.preventDefault();
    searchRef.current = scattersAppModel.getParamsData(true);
    searchRef.current.call();
  }

  function toggleEditMode(): void {
    toggleSelectAdvancedMode();
  }

  const options: ISelectOption[] = React.useMemo(() => {
    let data: ISelectOption[] = [];
    const systemOptions: ISelectOption[] = [];
    if (projectsData?.metrics) {
      for (let key in projectsData.metrics) {
        let system: boolean = isSystemMetric(key);
        for (let val of projectsData.metrics[key]) {
          let label: string = Object.keys(val)
            .map((item) => `${item}="${val[item]}"`)
            .join(', ');
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

  const dropDownOptions: { value: string; label: string }[] =
    React.useMemo(() => {
      let data: { value: string; label: string }[] = [];
      if (options) {
        for (let option of options) {
          data.push({ value: option.label, label: option.label });
        }
      }
      return data;
    }, [options]);

  function handleResetSelectForm(): void {
    onSelectOptionsChange([]);
    onSelectRunQueryChange('');
  }

  function onChange(
    type: 'x' | 'y',
    option: { value: string; label: string } | null,
  ): void {
    if (option) {
      const selectedOptions = selectedOptionsData?.options;
      if (type === 'y') {
        onSelectOptionsChange([
          options.find((o) => o.label === option.value),
          selectedOptions.length === 2 ? selectedOptions[1] : null,
        ]);
      } else if (type === 'x') {
        onSelectOptionsChange([
          selectedOptions[0] || null,
          options.find((o) => o.label === option.value),
        ]);
      }
    }
  }

  return (
    <div className='SelectForm'>
      <div className='SelectForm__container__options'>
        <Box
          width='100%'
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          {selectedOptionsData?.advancedMode ? (
            <div className='SelectForm__textarea'>
              <form onSubmit={handleParamsSearch}>
                <TextField
                  fullWidth
                  multiline
                  size='small'
                  spellCheck={false}
                  rows={3}
                  variant='outlined'
                  placeholder={
                    'metric.name in [“loss”, “accuracy”] and run.learning_rate > 10'
                  }
                  value={selectedOptionsData?.advancedQuery ?? ''}
                  onChange={({ target }) =>
                    onSelectAdvancedQueryChange(target.value)
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleParamsSearch(e);
                    }
                  }}
                />
              </form>
            </div>
          ) : (
            <Box display='flex' alignItems='center' flex={1}>
              <Dropdown
                key='y-axis'
                size='large'
                isColored
                onChange={(option) => onChange('y', option)}
                value={selectedOptionsData?.options[0]?.label || null}
                options={dropDownOptions}
                onMenuOpen={() => setOpen({ y: true, x: false })}
                onMenuClose={() => setOpen({ y: false, x: false })}
                open={open.y}
                withPortal
                placeholder='Select Y axis'
              />
              <Divider
                style={{ margin: '0 1rem' }}
                orientation='vertical'
                flexItem
              />
              <Dropdown
                key='x-axis'
                size='large'
                isColored
                onChange={(option) => onChange('x', option)}
                value={selectedOptionsData?.options[1]?.label || null}
                options={dropDownOptions}
                onMenuOpen={() => setOpen({ y: false, x: true })}
                onMenuClose={() => setOpen({ y: false, x: false })}
                open={open.x}
                withPortal
                placeholder='Select X axis'
              />
            </Box>
          )}
        </Box>
        {selectedOptionsData?.advancedMode ? null : (
          <div className='SelectForm__TextField'>
            <form onSubmit={handleParamsSearch}>
              <TextField
                fullWidth
                size='small'
                variant='outlined'
                spellCheck={false}
                inputProps={{ style: { height: '0.687rem' } }}
                placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
                value={selectedOptionsData?.query ?? ''}
                onChange={({ target }) => onSelectRunQueryChange(target.value)}
              />
            </form>
          </div>
        )}
      </div>
      <Divider style={{ margin: '0 1rem' }} orientation='vertical' flexItem />
      <div className='SelectForm__container__search'>
        <Button
          fullWidth
          color='primary'
          variant='contained'
          startIcon={<SearchOutlined />}
          className='SelectForm__search__button'
          onClick={handleParamsSearch}
        >
          Search
        </Button>
        <div className='SelectForm__search__actions'>
          <Tooltip title='Reset query'>
            <div>
              <Button onClick={handleResetSelectForm} withOnlyIcon={true}>
                <Icon name='reset' />
              </Button>
            </div>
          </Tooltip>
          <Tooltip
            title={
              selectedOptionsData?.advancedMode
                ? 'Switch to default mode'
                : 'Enable advanced search mode '
            }
          >
            <div>
              <Button
                className={selectedOptionsData?.advancedMode ? 'active' : ''}
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
