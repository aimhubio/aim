import {
  IRunOverviewTabArtifact,
  IRunOverviewTabArtifactRow,
} from './RunOverviewTabArtifactsCard.d';

/**
 * Builds the rows rendered by the "Run Artifacts" table.
 *
 * The table identifies every row by its `key` field (see `Table`/`BaseTable`).
 * Artifacts returned by the API only carry `name`, `path` and `uri`, so a key
 * has to be derived here. Without a unique key all the rows share the very
 * same identifier, the table then applies the height measured for a single row
 * to every row and the list keeps jumping around (aimhubio/aim#3425).
 */
export function getArtifactsTableData(
  artifacts: IRunOverviewTabArtifact[] | null | undefined,
): IRunOverviewTabArtifactRow[] {
  return (artifacts || []).map((artifact, index) => ({
    ...artifact,
    key: artifact?.name || artifact?.uri || index,
  }));
}
