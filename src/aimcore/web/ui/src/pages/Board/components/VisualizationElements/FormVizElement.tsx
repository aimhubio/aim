import { Button } from 'components/kit_v2';

function FormVizElement(props: any) {
  return (
    <form
      className='block--form'
      onSubmit={(e) => {
        e.preventDefault();
        props.callbacks?.on_submit?.();
      }}
    >
      {props.children}
      <Button type='submit'>
        {props.options?.submit_button_label || 'Submit'}
      </Button>
    </form>
  );
}

export default FormVizElement;
