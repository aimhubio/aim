import React from 'react';

import { Box, Divider } from '@material-ui/core';

import { Button, Dropdown, Icon } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete';

import COLORS from 'config/colors/colors';

import useModel from 'hooks/model/useModel';
import useParamsSuggestions from 'hooks/projectData/useParamsSuggestions';

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
  requestIsPending,
  selectedOptionsData,
  onSelectOptionsChange,
  onSelectRunQueryChange,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState({
    x: false,
    y: false,
  });
  const projectsData = useModel<IProjectsModelState>(projectsModel);
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
    searchRef.current = scattersAppModel.getScattersData(true);
    searchRef.current.call();
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchRef.current?.abort();
    scattersAppModel.abortRequest();
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
    <div className='Scatters__SelectForm'>
      <Box display='flex'>
        <div className='Scatters__SelectForm__container__options'>
          <Box
            width='100%'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Box display='flex' alignItems='center' flex={1}>
              <Dropdown
                key='y-axis'
                size='medium'
                isColored
                onChange={(option) => onChange('y', option)}
                value={selectedOptionsData?.options[0]?.label || null}
                options={dropDownOptions}
                onMenuOpen={() => setOpen({ y: true, x: false })}
                onMenuClose={() => setOpen({ y: false, x: false })}
                open={open.y}
                withPortal
                label='Y axis'
                icon={{ name: 'y-axis' }}
              />
              <Divider
                style={{ margin: '0 1rem' }}
                orientation='vertical'
                flexItem
              />
              <Dropdown
                key='x-axis'
                size='medium'
                isColored
                onChange={(option) => onChange('x', option)}
                value={selectedOptionsData?.options[1]?.label || null}
                options={dropDownOptions}
                onMenuOpen={() => setOpen({ y: false, x: true })}
                onMenuClose={() => setOpen({ y: false, x: false })}
                open={open.x}
                withPortal
                label='X axis'
                icon={{ name: 'x-axis' }}
              />
            </Box>
          </Box>
        </div>
        <Divider style={{ margin: '0 1rem' }} orientation='vertical' flexItem />
        <div className='Scatters__SelectForm__container__search'>
          <Button
            color='primary'
            variant={requestIsPending ? 'outlined' : 'contained'}
            startIcon={
              <Icon
                name={requestIsPending ? 'close' : 'search'}
                fontSize={requestIsPending ? 12 : 14}
              />
            }
            className='Scatters__SelectForm__search__button'
            onClick={requestIsPending ? handleRequestAbort : handleParamsSearch}
            disabled={
              !selectedOptionsData?.options[0] ||
              !selectedOptionsData?.options[1]
            }
          >
            {requestIsPending ? 'Cancel' : 'Search'}
          </Button>
        </div>
      </Box>
      <div className='Scatters__SelectForm__TextField'>
        <ExpressionAutoComplete
          onExpressionChange={onSelectRunQueryChange}
          onSubmit={handleParamsSearch}
          value={selectedOptionsData?.query}
          options={paramsSuggestions}
          placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
        />
      </div>
    </div>
  );
}

export default React.memo(SelectForm);
