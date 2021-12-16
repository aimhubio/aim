import React from 'react';
import { isEmpty } from 'lodash-es';

import { Box, Checkbox, Divider, InputBase, Popper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Icon, Badge, Button } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete';

import COLORS from 'config/colors/colors';

import useModel from 'hooks/model/useModel';
import useParamsSuggestions from 'hooks/projectData/useParamsSuggestions';

import projectsModel from 'services/models/projects/projectsModel';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';

import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import { ISelectFormProps } from 'types/pages/imagesExplore/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import contextToString from 'utils/contextToString';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  selectedImagesData,
  onImagesExploreSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onSearchQueryCopy,
  searchButtonDisabled,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<IProjectsModelState>(projectsModel);
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchMetricsRef = React.useRef<any>(null);

  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getProjectParams(['images']);
    paramsMetricsRequestRef.call();
    return () => {
      paramsMetricsRequestRef?.abort();
      searchMetricsRef.current?.abort();
    };
  }, []);

  function handleSearch(e: React.ChangeEvent<any>): void {
    e.preventDefault();
    if (requestIsPending) {
      return;
    }
    searchMetricsRef.current = imagesExploreAppModel.getImagesData(true);
    searchMetricsRef.current.call();
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchMetricsRef.current?.abort();
    imagesExploreAppModel.abortRequest();
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onImagesExploreSelectChange(
      value.filter((option: ISelectOption) => lookup[option.label] === 0),
    );
  }

  function handleDelete(field: string): void {
    let fieldData = [...selectedImagesData?.options].filter(
      (opt: ISelectOption) => opt.label !== field,
    );
    onImagesExploreSelectChange(fieldData);
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
    let index: number = 0;
    if (projectsData?.images) {
      for (let key in projectsData.images) {
        data.push({
          label: key,
          group: key,
          color: COLORS[0][index % COLORS[0].length],
          value: {
            option_name: key,
            context: null,
          },
        });
        index++;

        for (let val of projectsData.images[key]) {
          if (!isEmpty(val)) {
            let label = contextToString(val);
            data.push({
              label: `${key} ${label}`,
              group: key,
              color: COLORS[0][index % COLORS[0].length],
              value: {
                option_name: key,
                context: val,
              },
            });
            index++;
          }
        }
      }
    }

    return data;
  }, [projectsData]);

  function handleResetSelectForm(): void {
    onImagesExploreSelectChange([]);
    onSelectRunQueryChange('');
  }

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;

  const paramsSuggestions = useParamsSuggestions();

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
            {selectedImagesData?.advancedMode ? (
              <div className='SelectForm__textarea'>
                <ExpressionAutoComplete
                  isTextArea={true}
                  onExpressionChange={onSelectAdvancedQueryChange}
                  onSubmit={handleSearch}
                  value={selectedImagesData?.advancedQuery}
                  placeholder='images.name in [“loss”, “accuracy”] and run.learning_rate > 10'
                  options={[
                    'images.name',
                    'images.context',
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
                    Images
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
                      className='Autocomplete__container'
                      size='small'
                      disablePortal={true}
                      disableCloseOnSelect
                      options={metricsOptions}
                      value={selectedImagesData?.options ?? ''}
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
                          className='SelectForm__metric__select'
                        />
                      )}
                      renderOption={(option) => {
                        let selected: boolean =
                          !!selectedImagesData?.options.find(
                            (item: ISelectOption) =>
                              item.label === option.label,
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
                            <span className='SelectForm__option__label'>
                              {option.label}
                            </span>
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
                  {selectedImagesData?.options.length === 0 && (
                    <span className='SelectForm__tags__empty'>
                      No images are selected
                    </span>
                  )}
                  <Box className='SelectForm__tags ScrollBar__hidden'>
                    {selectedImagesData?.options?.map((tag: ISelectOption) => {
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
                  </Box>
                </Box>
                {selectedImagesData?.options.length > 1 && (
                  <span
                    onClick={() => onImagesExploreSelectChange([])}
                    className='SelectForm__clearAll'
                  >
                    <Icon name='close' />
                  </span>
                )}
              </>
            )}
          </Box>
        </Box>
        {selectedImagesData?.advancedMode ? null : (
          <div className='SelectForm__TextField'>
            <ExpressionAutoComplete
              onExpressionChange={onSelectRunQueryChange}
              onSubmit={handleSearch}
              value={selectedImagesData?.query}
              options={paramsSuggestions}
              placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
            />
          </div>
        )}
      </div>

      <div className='SelectForm__search__container'>
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
          className='SelectForm__search__button'
          onClick={requestIsPending ? handleRequestAbort : handleSearch}
          disabled={searchButtonDisabled}
        >
          {requestIsPending ? 'Cancel' : 'Search'}
        </Button>
        <div className='SelectForm__search__actions'>
          <Button onClick={handleResetSelectForm} withOnlyIcon={true}>
            <Icon name='reset' />
          </Button>
          <Button
            className={selectedImagesData?.advancedMode ? 'active' : ''}
            withOnlyIcon={true}
            onClick={toggleEditMode}
          >
            <Icon name='edit' />
          </Button>
          <Button onClick={onSearchQueryCopy} withOnlyIcon={true}>
            <Icon name='copy' />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SelectForm);
