import { IRunRequestProgress } from "utils/app/setRunRequestProgress";

export interface IProgressBarProps {
 progress: IRunRequestProgress;
 processing?: boolean;
 pendingStatus?: boolean;
}
