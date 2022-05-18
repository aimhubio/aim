import _ from 'lodash-es';

function getDocumentTitle(
  pathname: string,
  locationParams: { [key: string]: string },
): string {
  const paths = pathname.slice(1).split('/');
  if (paths[0]) {
    let title = paths[0];
    if (_.isEmpty(locationParams)) {
      title = _.capitalize(title);
    } else {
      const locationParamValues = Object.values(locationParams);
      title = `${_.capitalize(title)}: ${locationParamValues[0]}`;
    }
    return title + ' | Aim';
  }
  return 'Aim';
}

export default getDocumentTitle;
