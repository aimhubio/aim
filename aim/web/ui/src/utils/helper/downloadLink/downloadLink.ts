function downloadLink(href: string, name: string = 'download'): void {
  let link = document.createElement('a');
  link.download = name;
  link.style.opacity = '0';
  document.body.append(link);
  link.href = href;
  link.click();
  link.remove();
}

export default downloadLink;
