import { ISyntaxErrorDetail } from 'types/components/NotificationContainer/NotificationContainer';

/**
 * @function removeSyntaxErrBrackets
 * @param detail {ISyntaxErrorDetail} - syntax error detail
 * @param advancedModeOn {boolean} - advanced mode on/off
 */
function removeSyntaxErrBrackets(
  detail: ISyntaxErrorDetail,
  advancedModeOn: boolean,
): ISyntaxErrorDetail {
  const offsetDiff = advancedModeOn ? 1 : 2;
  const syntaxErrDetail: ISyntaxErrorDetail = {
    ...detail,
    offset: detail.offset - offsetDiff,
  };
  if (detail.end_offset) {
    syntaxErrDetail.end_offset = detail.end_offset - offsetDiff;
  }
  return syntaxErrDetail;
}

export default removeSyntaxErrBrackets;
