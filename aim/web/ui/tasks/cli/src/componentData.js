const getTypesBaseCode = (name) => `
  export interface I${name}Props {
      title: string;
  };
`;

const getComponentBaseCode = (name) => `
    import React from 'react';
    import { Text } from 'components/kit';
    import { I${name}Props } from './types';
    
    import './styles.scss';
    
    function TestTest({
      title,
    }: I${name}Props): React.FunctionComponentElement<React.ReactNode> {
      return (
        <div className={"${name}"}>
          <Text>{title}</Text>
        </div>
      );
    }
    
    export default React.memo<I${name}Props>(TestTest);
`;

const getExportsBaseCode = (name) => `
  import ${name} from './${name}';
  
  export * from './types';
  export * from './${name}';
  
  export default ${name};
`;

const getStylesBaseCode = (name) => {
  return `@use 'src/styles/abstracts' as *;

.${name} {
  display: flex;
  justify-content: center;
  align-items: center;
}
  `;
};

module.exports = {
  getTypesBaseCode,
  getStylesBaseCode,
  getComponentBaseCode,
  getExportsBaseCode,
};
