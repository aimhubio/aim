function getInnerTextFromHtml(htmlString: string): string {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.textContent || div.innerText || '';
}

export default getInnerTextFromHtml;
