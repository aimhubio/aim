import { render } from '@testing-library/react';
import { IconCheck } from '@tabler/icons';

import { ToastProvider, Toast } from '.';

// Test of the Toast component
describe(`<ToastProvider>
             <Toast
                id={1}
                icon={<IconCheck />}
                message='Aim is an open-source, self-hosted ML experiment tracking tool'
               />
           </ToastProvider>`, () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(
      <ToastProvider>
        <Toast
          id={1}
          icon={<IconCheck />}
          message='AimOS is an easy-to-use modular observability for AI Systems. Extensible, scalable and modular.'
        />
      </ToastProvider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  // test onClick event
  test('onClick event works properly', () => {
    const onClick = jest.fn();
    const { getByTestId } = render(
      <ToastProvider>
        <Toast
          id={1}
          icon={<IconCheck />}
          onDelete={() => {}}
          onUndo={() => {}}
          message='AimOS is an easy-to-use modular observability for AI Systems. Extensible, scalable and modular.'
        />
      </ToastProvider>,
    );
    const deleteButton = getByTestId('toast-delete');
    const undoButton = getByTestId('toast-undo');
    deleteButton.click();
    expect(onClick).toHaveBeenCalled();
    undoButton.click();
    expect(onClick).toHaveBeenCalled();
  });
});
