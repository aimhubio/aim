import { Button } from 'components/kit_v2';

function FormVizElement(props: any) {
  return (
    <div className='block--form'>
      {props.children}
      <Button onClick={() => props.callbacks?.on_submit?.()}>
        {props.options?.submit_button_label || 'Submit'}
      </Button>
    </div>
  );
}

export default FormVizElement;
