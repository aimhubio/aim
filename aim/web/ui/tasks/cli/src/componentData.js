const getTypesBaseCode = (name) => `
  export interface I${name}Props {
      title: string;
  };
`;

const getComponentBaseCode = (name) => `
    import React from 'react';
    import { Text } from 'components/kit';
    import { I${name}Props } from './types.d';
    
    import './${name}.scss';
    
    function ${name}({
      title,
    }: I${name}Props): React.FunctionComponentElement<React.ReactNode> {
      return (
        <div className={"${name}"}>
          <Text>{title}</Text>
        </div>
      );
    }
    
    ${name}.displayName = '${name}';
    
    export default React.memo<I${name}Props>(${name});
`;

const getExportsBaseCode = (name) => `
  import ${name} from './${name}';
  
  export * from './${name}.d';
  
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
