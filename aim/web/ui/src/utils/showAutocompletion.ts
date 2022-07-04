import _ from 'lodash-es';

import { Monaco } from '@monaco-editor/react';

import getObjectPaths, { jsValidVariableRegex } from './getObjectPaths';
import getValue from './helper/getValue/getValue';

function showAutocompletion(monaco: Monaco, options: Record<string, string>) {
  // Register object that will return autocomplete items
  return monaco?.languages.registerCompletionItemProvider(
    'python',
    getSuggestions(monaco, options),
  );
}

const specialCharactersForWordSplitting = ['(', '='];

function getDetailType(detail: any): {
  type: string;
  hasExampleType: boolean;
} {
  const hasExampleType = detail?.hasOwnProperty('__example_type__');
  let type: string = '';
  if (hasExampleType) {
    let sliced = detail.__example_type__.slice(
      7,
      detail.__example_type__.length - 1,
    );
    switch (sliced) {
      case "'str'":
        type = 'str';
        break;
      case "'int'":
        type = 'int';
        break;
      case "'bool'":
        type = 'bool';
        break;
      case "'list'":
        type = 'list';
        break;
      case "'float'":
        type = 'float';
        break;
      case "'bytes'":
        type = 'bytes';
        break;
      //TODO: Add datetime type
      default:
        type = 'unknown';
        break;
    }
  } else {
    switch (typeof detail) {
      case 'object':
        type = 'dict';
        break;
      case 'string':
        type = 'str';
        break;
      case 'boolean':
        type = 'bool';
        break;
      case 'number':
        type = 'int';
        break;
    }
  }
  return { type, hasExampleType };
}

// Helper function to return the monaco completion item type of a thing
function getType(monaco: Monaco, maybe: any, isMember = false) {
  switch ((typeof maybe).toLowerCase()) {
    case 'object':
      return monaco.languages.CompletionItemKind.Class;

    // Now we don't have such autocompletion scenario,
    // but we may support showing possible methods with their docstrings in the future
    case 'function':
      return isMember
        ? monaco.languages.CompletionItemKind.Method
        : monaco.languages.CompletionItemKind.Function;
    default:
      return isMember
        ? monaco.languages.CompletionItemKind.Property
        : monaco.languages.CompletionItemKind.Variable;
  }
}

function getSuggestions(monaco: Monaco, options: Record<string, string>) {
  /* eslint-disable */
  // NOTE: this code segment was taken(modified) from the following git gist
  // https://gist.github.com/mwrouse/05d8c11cd3872c19c684bd1904a2202e
  return {
    //TODO: Maybe support manual trigger such as [Ctrl + Space]
    triggerCharacters: ['.'],

    // Function to generate autocompletion results
    provideCompletionItems(model: any, position: any) {
      // Split everything the user has typed on the current line up at each space, and only look at the last word
      const lastChars = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const words = lastChars.replace('\t', '').split(' ');
      let activeTyping: any = _.last(words); // What the user is currently typing (everything after the last space)

      specialCharactersForWordSplitting.forEach((char) => {
        if (activeTyping.includes(char)) {
          activeTyping = _.last(activeTyping.split(char));
        }
      });

      if (!Object.keys(options).some((key) => activeTyping.startsWith(key))) {
        // Here, we are interested only in these cases where the active typing starts
        // with one of the first level keys of "options" object.
        // For example, the common "options" object for NodeEditor will look like this:
        // { context: { user: { id: ..., name: ..., email: ... }, classes: { ... }, ... } }
        // In this particular case, we are interested only in the case where activeTyping starts with the word
        // "context". In all other cases, we return "null" to force the monaco to fall back to the next suggest provider
        // read more about this issue here - https://github.com/microsoft/monaco-editor/issues/2646
        return null;
      }
      // flatten strings of array of accessible options paths without example type
      const filteredOptions = getObjectPaths(options, options).map((option) => {
        const indexOf =
          option.indexOf('.__example_type__') !== -1 ||
          option[option.length - 1] === '.'
            ? option.indexOf('.__example_type__')
            : option.length;
        return option.slice(0, indexOf);
      });
      // If the last character typed is a period then we need to look at member objects of the `options` object
      const isMember = activeTyping.charAt(activeTyping.length - 1) === '.';

      let isIncluded: boolean = false;
      // Array of autocompletion results
      const suggestions: any = [];

      //Checking is the word included in options list
      for (let option of filteredOptions) {
        if (
          option.split(activeTyping)[0] === '' ||
          (isMember &&
            option.split(activeTyping.slice(0, activeTyping.length - 2))[0] ===
              '')
        ) {
          isIncluded = true;
          break;
        }
      }
      // Used for generic handling between member and non-member objects
      let lastToken: any = options;
      let prefix = activeTyping;
      if (isMember && isIncluded) {
        // Is a member, get a list of all members, and the prefix
        lastToken = getValue(options, prefix.substring(0, prefix.length - 1));
      }

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // Get all the child properties of the last token
      for (const prop in lastToken) {
        // Do not show properites that begin with "__"
        if (lastToken.hasOwnProperty(prop) && !prop.startsWith('__')) {
          // Create completion object

          const key = !jsValidVariableRegex.test(prop) ? `["${prop}"]` : prop;

          let detailType = getDetailType(getValue(options, prefix + key));
          const completionItem = {
            label: key,
            kind: getType(
              monaco,
              detailType.hasExampleType ? detailType.type : lastToken[prop],
              isMember,
            ),
            insertText: key,
            detail: detailType.type,
            range,
          };
          // Change insertText for functions
          if (
            completionItem.kind ===
              monaco.languages.CompletionItemKind.Function ||
            completionItem.kind === monaco.languages.CompletionItemKind.Method
          ) {
            completionItem.insertText += '(';
          }

          // Add to final suggestionss
          suggestions.push(completionItem);
        }
      }
      return { suggestions: isIncluded ? suggestions : [] };
    },
  };
}

export { showAutocompletion };
