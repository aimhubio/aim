// Handy JavaScript to measure the size taken to render the supplied text;
// you can supply additional style information too if you have it.

function measureText(
  text: string,
  fontSize: number = 16,
): {
  width: number;
  height: number;
} {
  let div = document.createElement('div');
  document.body.appendChild(div);
  div.style.fontSize = '' + fontSize + 'px';
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.height = 'auto';
  div.style.width = 'auto';
  div.style.whiteSpace = 'nowrap';

  div.innerText = text;

  const result = {
    width: div.clientWidth,
    height: div.clientHeight,
  };
  document.body.removeChild(div);

  return result;
}

export default measureText;
