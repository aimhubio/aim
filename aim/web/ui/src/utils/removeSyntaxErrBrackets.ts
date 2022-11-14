import { ISyntaxErrorDetail } from 'types/components/NotificationContainer/NotificationContainer';

/**
 * @function removeSyntaxErrBrackets - remove unused brackets from syntax error message
 * @param detail {ISyntaxErrorDetail} - syntax error detail
 * @param advancedModeOn {boolean} - advanced mode on/off
 *
 * @return syntaxErrDetail - processed syntax error detail
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
