import { TreeProps } from 'antd';
// The interface for the Tree component
export interface ITreeProps extends Partial<TreeProps> {
  /**
   * Tree data
   * @default []
   * @type {TreeProps['DataNode']}
   */
  data?: TreeProps['DataNode'];
  /**
   * tree node check callback
   * @default () => {}
   * */
  onCheckChange?: TreeProps['onCheck'];
  /**
   * tree search value
   * @default: ''
   * */
  searchValue?: string;
}
