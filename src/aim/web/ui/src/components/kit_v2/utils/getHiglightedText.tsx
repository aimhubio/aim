import Box from '../Box';
import Text from '../Text';

export function getHighlightedText(text: string, highlight: string) {
  // Split on highlight term and include term into parts, ignore case
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <Text>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Box as='span' key={i} css={{ bc: '$mark' }}>
            {part}
          </Box>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
