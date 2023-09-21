import * as React from 'react';

import { IconPlus } from '@tabler/icons-react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Box, Button, Input, Link, Text } from 'components/kit_v2';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import Illustration, { ILLUSTRATION_TYPES } from 'components/Illustration';

import { PathEnum } from 'config/enums/routesEnum';
import { TopBar } from 'config/stitches/foundations/layout';

import usePyodide from 'services/pyodide/usePyodide';

import { AppsCardWrapper, AppsContainer } from './Apps.style';
import AppCard from './components/AppCard';

function Apps(): React.FunctionComponentElement<React.ReactNode> {
  const { registeredPackages, isLoading } = usePyodide();
  const [searchValue, setSearchValue] = React.useState<string>('');

  return (
    <ErrorBoundary>
      <TopBar>
        <Text weight='$3'>APPS</Text>
      </TopBar>
      <AppsContainer>
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          {registeredPackages?.length > 0 ? (
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
                {registeredPackages
                  .filter((appName: string) =>
                    appName
                      .toLowerCase()
                      .includes(searchValue.trim().toLowerCase()),
                  )
                  .map((appName: string) => (
                    <AppCard key={appName} name={appName} description={null} />
                  ))}
              </AppsCardWrapper>
            </>
          ) : (
            <Illustration type={ILLUSTRATION_TYPES.Empty_Apps} />
          )}
        </BusyLoaderWrapper>
      </AppsContainer>
    </ErrorBoundary>
  );
}

export default Apps;
