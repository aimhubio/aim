import * as React from 'react';
import * as _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Box, Input, Text } from 'components/kit_v2';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import Illustration, { ILLUSTRATION_TYPES } from 'components/Illustration';

import { TopBar } from 'config/stitches/foundations/layout';

import usePyodide from 'services/pyodide/usePyodide';

import { AppsCardWrapper, AppsContainer } from './Apps.style';
import AppCard from './components/AppCard';

function Apps(): React.FunctionComponentElement<React.ReactNode> {
  const { packages, isLoading } = usePyodide();
  const [searchValue, setSearchValue] = React.useState<string>('');

  return (
    <ErrorBoundary>
      <TopBar>
        <Text weight='$3'>APPS</Text>
      </TopBar>
      <AppsContainer>
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          {_.isEmpty(packages) ? (
            <Illustration type={ILLUSTRATION_TYPES.Empty_Apps} />
          ) : (
            <>
              <Box display='flex' ai='center'>
                <Box flex={1}>
                  <Input
                    inputSize='lg'
                    value={searchValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchValue(e.target.value)
                    }
                    css={{ maxWidth: 380 }}
                    placeholder='Search'
                  />
                </Box>
              </Box>
              <AppsCardWrapper>
                {Object.keys(packages)
                  .filter((appName: string) =>
                    appName
                      .toLowerCase()
                      .includes(searchValue.trim().toLowerCase()),
                  )
                  .map((appName: string) => (
                    <AppCard
                      key={appName}
                      name={appName}
                      {...packages[appName]}
                    />
                  ))}
              </AppsCardWrapper>
            </>
          )}
        </BusyLoaderWrapper>
      </AppsContainer>
    </ErrorBoundary>
  );
}

export default Apps;
