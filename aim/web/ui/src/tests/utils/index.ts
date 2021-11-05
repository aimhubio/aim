import renderer from 'react-test-renderer';
import { ReactComponentElement } from 'react';

export const toMatchObject = (expectedValue: any, actualValue: any) => {
  expect(expectedValue).toMatchObject(actualValue);
};

// width react-test-renderer
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

export const compareObject = (
  testCase: string,
  expectedValue: any,
  actualValue: any,
) => {
  test(testCase, () => {
    toMatchObject(expectedValue, actualValue);
  });
};

export const toEqual = (expectedValue: any, actualValue: any) => {
  expect(actualValue).toEqual(actualValue);
};
