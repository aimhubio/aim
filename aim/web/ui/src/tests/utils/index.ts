export const shouldMatchObject = (expectedValue: any, actualValue: any) => {
  expect(expectedValue).toMatchObject(actualValue);
};

/**
 * [temp] for react-test-renderer
 * @TODO delete this code later, after surely working with react testing library
 */
/*
  export const getComponentTree = (Component: ReactComponentElement<any>) => {
    const component = renderer.create(Component);
    return component.toJSON();
  };


  export const checkSnapshot = (
    testCase: string,
    Component: ReactComponentElement<any>,
  ) => {
    test(testCase, () => {
      const tree = getComponentTree(Component);
      expect(tree).toMatchSnapshot();
    });
  };
*/

export const toEqual = (expectedValue: any, actualValue: any) => {
  expect(expectedValue).toEqual(actualValue);
};
