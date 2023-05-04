import React from 'react';
import { Prompt, useHistory } from 'react-router-dom';

import { IconAlertTriangle } from '@tabler/icons-react';

import { Dialog } from 'components/kit_v2';

import { IRouteLeavingGuardProps } from './RouteLeavingGuard.d';

function RouteLeavingGuard({
  when,
  message = 'Changes you made may not be saved.',
}: IRouteLeavingGuardProps) {
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [nextLocation, setNextLocation] = React.useState<string>('');
  const [confirmNavigation, setConfirmNavigation] = React.useState(false);
  const history = useHistory();

  React.useEffect(() => {
    if (confirmNavigation) {
      history.push(nextLocation);
      setConfirmNavigation(false);
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmNavigation, when]);

  function onBeforeUnload(event: any): string | undefined {
    if (!when) {
      return;
    } else {
      event?.preventDefault();
      if (event) {
        event.returnValue =
          'Your changes is not saved. Do you still want to leave';
      }
      return '';
    }
  }

  function showModal(location: string): void {
    setOpenModal(true);
    setNextLocation(location);
  }

  function closeModal() {
    setOpenModal(false);
  }

  function handleBlockedNavigation(location: Location | any): boolean {
    if (!confirmNavigation) {
      showModal(location.pathname);
      return false;
    }
    return true;
  }
  function handleConfirm(): void {
    closeModal();
    if (nextLocation) {
      setConfirmNavigation(true);
    }
  }

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      <Dialog
        title='Are you sure'
        onOpenChange={(val) => {
          if (!val) {
            closeModal();
          }
        }}
        open={openModal}
        titleIcon={<IconAlertTriangle />}
        onConfirm={handleConfirm}
        description={message}
      />
    </>
  );
}

export default RouteLeavingGuard;
