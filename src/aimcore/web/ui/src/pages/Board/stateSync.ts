import appsService from 'services/api/apps/appsService';

async function getKeyFromBoardState(
  boardPath: string,
  state: Record<string, any>,
) {
  let app = await appsService
    .createApp({
      state,
      type: boardPath,
    })
    .call();

  return app.id;
}

async function getBoardStateFromKey(key: string) {
  let app = await appsService.fetchApp(key).call();

  return app.state;
}

export { getKeyFromBoardState, getBoardStateFromKey };
