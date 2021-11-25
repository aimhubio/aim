import React from 'react';

export interface IAutoSuggestionsProps {
  suggestionsList: string[];
  suggestionsPosition: { left: number; top: number };
  suggestionsRef: React.RefObject;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement>;
  onSuggestionClick: (suggestion: string) => void;
  setSuggestionsList: (list: string[]) => void;
}
