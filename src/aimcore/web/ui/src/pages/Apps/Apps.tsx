import * as React from 'react';
import * as _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Box, Input, Separator, Text } from 'components/kit_v2';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import Illustration, { ILLUSTRATION_TYPES } from 'components/Illustration';

import { TopBar } from 'config/stitches/foundations/layout';

import usePyodide from 'services/pyodide/usePyodide';

import { AppsCardWrapper, AppsContainer } from './Apps.style';
import AppCard from './components/AppCard';

function Apps(): React.FunctionComponentElement<React.ReactNode> {
  const { packages, isLoading } = usePyodide();
  const [searchValue, setSearchValue] = React.useState<string>('');

  const categories = React.useMemo(() => {
    if (_.isEmpty(packages)) return {};

    const result: Record<string, any> = {};

    for (let pkg in packages) {
      const { category } = packages[pkg];

      if (!result.hasOwnProperty(category)) {
        result[category] = [];
      }
      result[category ?? 'Unknown'].push(packages[pkg]);
    }

    return result;
  }, [packages]);

  return (
    <ErrorBoundary>
      <TopBar>
        <Text weight='$3'>APPS</Text>
      </TopBar>
      <AppsContainer>
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          {_.isEmpty(categories) ? (
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
              {Object.keys(categories).map((category: string) => {
                const filteredPackages = categories[category].filter(
                  (pkg: any) =>
                    pkg.name
                      .toLowerCase()
                      .includes(searchValue.trim().toLowerCase()),
                );

                return (
                  filteredPackages.length > 0 && (
                    <Box key={category} mt='$8'>
                      <Text weight='$3' color='$textPrimary' size='$8'>
                        {category}
                      </Text>
                      <Separator css={{ mt: '$4' }} />
                      <AppsCardWrapper>
                        {filteredPackages.map((pkg: any) => (
                          <AppCard key={pkg.name} {...pkg} />
                        ))}
                      </AppsCardWrapper>
                    </Box>
                  )
                );
              })}
            </>
          )}
        </BusyLoaderWrapper>
      </AppsContainer>
    </ErrorBoundary>
  );
}

export default Apps;
