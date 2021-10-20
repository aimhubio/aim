/**
 * @property {React.ChangeEvent<any>} event - stopping propagate event to parent
 */

function stopPropagation(event: React.ChangeEvent<any>) {
  event.stopPropagation();
}

stopPropagation.displayName = 'stopPropagation';

export default stopPropagation;
