import _ from 'lodash-es';

function getDocumentTitle(
  pathname: string,
  params: { [key: string]: string },
): string {
  const paths = pathname.slice(1).split('/');
  const title = paths[0] || 'Aim';
  if (_.isEmpty(params)) {
    return _.capitalize(title);
  } else {
    const locationParams = Object.values(params);
    return `${_.capitalize(title)}: ${locationParams[0]}`;
  }
}

export default getDocumentTitle;
