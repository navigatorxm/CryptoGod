'use client';

// Wrapper to resolve react-syntax-highlighter JSX type incompatibility with React 18
import SyntaxHighlighter from 'react-syntax-highlighter';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

const CodeBlock = SyntaxHighlighter as unknown as React.FC<SyntaxHighlighterProps>;
export default CodeBlock;
