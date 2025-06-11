import React from 'react';

interface SearchResultHighlightProps {
  highlights?: {
    title?: string[];
    content?: string[];
    [key: string]: string[] | undefined;
  };
  maxContentFragments?: number;
}

export default function SearchResultHighlight({
  highlights = {},
  maxContentFragments = 2
}: SearchResultHighlightProps) {
  if (!highlights || Object.keys(highlights).length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 mt-2">
      {/* Title highlights */}
      {highlights.title && highlights.title.length > 0 && (
        <div className="text-sm font-medium">
          <span
            dangerouslySetInnerHTML={{
              __html: highlights.title[0]
            }}
          />
        </div>
      )}

      {/* Content highlights */}
      {highlights.content && highlights.content.length > 0 && (
        <div className="text-sm text-muted-foreground space-y-1">
          {highlights.content.slice(0, maxContentFragments).map((fragment, i) => (
            <div 
              key={i}
              className="line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: `...${fragment}...`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 