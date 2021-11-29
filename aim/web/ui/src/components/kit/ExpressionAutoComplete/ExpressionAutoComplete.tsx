import React from 'react';

import CodeEditor from '@uiw/react-textarea-code-editor';

import { AutoSuggestions } from 'components/kit';

import getCaretCoordinates from 'utils/getCaretPosition';

import { IExpressionAutoCompleteProps } from './ExpressionAutoComplete.d';

import './ExpressionAutoComplete.scss';

function ExpressionAutoComplete({
  onExpressionChange,
  onSubmit,
  value = '',
  options,
  isTextArea,
  placeholder,
}: IExpressionAutoCompleteProps): React.FunctionComponentElement<React.ReactNode> {
  const [caretPosition, setCaretPosition] = React.useState(0);
  const [suggestionsPosition, setSuggestionsPosition] = React.useState({
    left: 0,
    top: 0,
  });
  const [suggestionsList, setSuggestionsList] = React.useState<string[]>([]);
  const inputRef = React.useRef<any>();
  const textRef = React.useRef<any>();
  const suggestionsRef = React.useRef<any>({});

  React.useEffect(() => {
    let suggestions = getSuggestionsList();
    setSuggestionsList(suggestions);
  }, [value]);

  function onCaretPositionChange(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLTextAreaElement>
      | any,
  ): void {
    let pos = getCaretCoordinates(e.target, e.target.selectionEnd);
    setCaretPosition(e.target.selectionEnd);
    pos.top = pos.top + (isTextArea ? 16 : 24);
    setSuggestionsPosition(pos);
  }

  function onSuggestionClick(suggestion: string): void {
    let result = /\S+$/.exec(value.slice(0, caretPosition));
    let leftString = value.slice(0, result?.index);
    let rightString = value.slice(caretPosition, value.length);
    let splitResult = result?.[0]?.split('.');
    if (splitResult) {
      splitResult[splitResult?.length - 1] = suggestion;
      onExpressionChange(`${leftString}${splitResult.join('.')}${rightString}`);
      setCaretPosition(caretPosition + splitResult.join('.').length);
      setSuggestionsList([]);
      inputRef.current.focus();
    }
  }

  function onInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | any>,
  ): void {
    if (e.key === 'ArrowDown' && suggestionsList.length > 0) {
      suggestionsRef.current.buttonProps.onClick(
        suggestionsRef.current.buttonProps.ref.current,
      );
    } else if (e.key === 'ArrowUp') {
      if (isTextArea) {
        setSuggestionsList([]);
      } else {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (isTextArea) {
        let rowsCount: number = value.split('\n').length;
        if (rowsCount === 3) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        onSubmit(e);
        e.preventDefault();
        e.stopPropagation();
      }
    } else {
      onCaretPositionChange(e);
    }
  }

  function onValueChange(e: React.ChangeEvent<HTMLInputElement> | any): void {
    onCaretPositionChange(e);
    onExpressionChange(e.target.value);
  }

  const list: string[] = React.useMemo(() => {
    let suggestions = [
      'run.hash',
      'run.name',
      'run.experiment',
      'run.tags',
      'run.archived',
      'run.creation_time',
      'run.end_time',
    ];
    if (options.length > 0) {
      suggestions = [...suggestions, ...options];
    }
    return suggestions;
  }, [options]);

  function getSuggestionsList(): string[] | [] {
    const suggestions: string[] = [];
    let result = /\S+$/.exec(value.slice(0, caretPosition))?.[0];
    if (result !== '.' && result?.includes('.')) {
      list.forEach((option) => {
        let suggest = option.split(`${result}`)[1];
        let splitSuggest = suggest?.split('.');
        let splitOption = option.split('.');
        if (splitSuggest?.length === 1) {
          if (splitSuggest[0] !== '' && splitOption[splitOption.length - 1]) {
            suggestions.push(splitOption[splitOption.length - 1]);
          }
        } else {
          if (
            suggestions.indexOf(splitSuggest?.[0]) === -1 &&
            suggestionsList.indexOf(
              result?.split('.')?.[result?.split('.')?.length - 1] +
                splitSuggest?.[0] || '',
            ) === -1
          ) {
            if (splitSuggest?.[0]) suggestions.push(splitSuggest?.[0]);
          }
        }
      });
    }
    return suggestions;
  }

  function onFieldBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    if (!e.relatedTarget) {
      setSuggestionsList([]);
    }
  }

  return (
    <div className='ExpressionAutoComplete'>
      {isTextArea ? (
        <textarea
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          onClick={onCaretPositionChange}
          className={`ExpressionAutoComplete__textarea ${
            value ? 'ExpressionAutoComplete__textarea__filled' : ''
          }`}
          onKeyDown={onInputKeyDown}
          onChange={onValueChange}
          onBlur={onFieldBlur}
        />
      ) : (
        <input
          value={value}
          ref={inputRef}
          spellCheck={false}
          onClick={onCaretPositionChange}
          className={`ExpressionAutoComplete__input ${
            value ? 'ExpressionAutoComplete__input__filled' : ''
          }`}
          placeholder={placeholder}
          onKeyDown={onInputKeyDown}
          onChange={onValueChange}
          onBlur={onFieldBlur}
        />
      )}
      <CodeEditor
        ref={textRef}
        value={value}
        language='python'
        className={`ExpressionAutoComplete__CodeEditor ${
          isTextArea
            ? 'ExpressionAutoComplete__CodeEditor__textarea'
            : 'ExpressionAutoComplete__CodeEditor__input'
        }`}
        padding={8}
      />
      {suggestionsList.length > 0 ? (
        <AutoSuggestions
          inputRef={inputRef}
          suggestionsRef={suggestionsRef}
          suggestionsList={suggestionsList}
          suggestionsPosition={suggestionsPosition}
          setSuggestionsList={setSuggestionsList}
          onSuggestionClick={onSuggestionClick}
        />
      ) : null}
    </div>
  );
}

export default ExpressionAutoComplete;
