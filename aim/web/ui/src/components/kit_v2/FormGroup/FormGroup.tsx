import React from 'react';

import Box from '../Box';

import { IFormGroupProps } from './FormGroup.d';
import {
  FormGroupActions,
  FormGroupContainer,
  FormGroupContent,
  FormGroupControl,
  FormGroupRow,
  FormGroupSection,
} from './FormGroup.style';

/**
 * FormGroup component params
 * @param {IFormGroupProps['data']} data - Form group data
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function FormGroup({
  data,
}: IFormGroupProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <FormGroupContainer>
      {data?.map((section, id) => {
        return (
          <FormGroupSection key={id}>
            {section?.sectionFields?.map((row, id: number) => {
              return (
                <FormGroupRow key={id}>
                  {row?.content && (
                    <FormGroupContent>{row?.content}</FormGroupContent>
                  )}
                  {row?.control && (
                    <FormGroupControl>{row?.control}</FormGroupControl>
                  )}
                  {row?.actions?.map((action, id: number) => {
                    return (
                      <FormGroupActions key={id}>
                        <Box>{action?.component}</Box>
                      </FormGroupActions>
                    );
                  })}
                </FormGroupRow>
              );
            })}
          </FormGroupSection>
        );
      })}
    </FormGroupContainer>
  );
}

FormGroup.displayName = 'FormGroup';
export default React.memo(FormGroup);
