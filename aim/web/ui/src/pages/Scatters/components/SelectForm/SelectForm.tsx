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
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  selectedOptionsData,
  selectFormOptions,
  onSelectOptionsChange,
  onSelectRunQueryChange,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState({
    x: false,
    y: false,
  });
  const searchRef = React.useRef<any>(null);
  const paramsSuggestions = useParamsSuggestions();

  React.useEffect(() => {
    return () => {
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

  const dropDownOptions: { value: string; label: string }[] =
    React.useMemo(() => {
      let data: { value: string; label: string }[] = [];
      if (selectFormOptions) {
        for (let option of selectFormOptions) {
          data.push({ value: option.label, label: option.label });
        }
      }
      return data;
    }, [selectFormOptions]);

  function onChange(
    type: 'x' | 'y',
    option: { value: string; label: string } | null,
  ): void {
    if (option) {
      const selectedOptions = selectedOptionsData?.options;
      if (type === 'y') {
        onSelectOptionsChange([
          selectFormOptions.find((o) => o.label === option.value),
          selectedOptions.length === 2 ? selectedOptions[1] : null,
        ]);
      } else if (type === 'x') {
        onSelectOptionsChange([
          selectedOptions[0] || null,
          selectFormOptions.find((o) => o.label === option.value),
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
              <Divider
                style={{ margin: '0 1rem' }}
                orientation='vertical'
                flexItem
              />
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
