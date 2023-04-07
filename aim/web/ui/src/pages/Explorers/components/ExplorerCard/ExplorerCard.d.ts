import { IRoute } from 'routes/routes';

export interface IExplorerCardProps extends IRoute {
  isLoading?: boolean;
  count?: number;
}
