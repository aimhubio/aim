import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { IModel, State } from 'types/services/models/model';
import updateURL from './updateURL';

export default function onMetricsSelectChange<
  M extends State,
  D extends Partial<ISelectMetricsOption[]>,
>({ data, model, appName }: { data: D; model: IModel<M>; appName: string }) {
  const configData = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, metrics: data },
    };

    updateURL({ configData: newConfig, appName });

    model.setState({
      config: newConfig,
    });
  }
}
