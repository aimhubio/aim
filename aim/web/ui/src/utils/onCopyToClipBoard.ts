import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IModel } from 'types/services/models/model';

export function onCopyToClipBoard(
  text: string,
  isCopied?: boolean,
  notificationCallBack?: ({
    notification,
    model,
  }: {
    notification: INotification;
    model: IModel<any>;
  }) => void,
  notificationBody?: { notification: INotification; model: IModel<any> },
) {
  if (text && !isCopied) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        ?.writeText(text)
        ?.then(() => {
          if (notificationCallBack && notificationBody) {
            notificationCallBack(notificationBody);
          }
        })
        .catch(() => {
          if (notificationCallBack && notificationBody) {
            notificationBody.notification.severity = 'error';
            notificationBody.notification.messages = ["Content isn't copied"];
            notificationCallBack(notificationBody);
          }
        });
    } else {
      const textArea: HTMLTextAreaElement = document.createElement('textarea');
      textArea.value = text;

      // make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-400vw';
      textArea.style.top = '-400vh';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        if (notificationCallBack && notificationBody) {
          notificationCallBack(notificationBody);
        }
      } catch (err) {
        if (notificationCallBack && notificationBody) {
          notificationBody.notification.severity = 'error';
          notificationBody.notification.messages = ["Content isn't copied"];
          notificationCallBack(notificationBody);
        }
      }
    }
  }
}
