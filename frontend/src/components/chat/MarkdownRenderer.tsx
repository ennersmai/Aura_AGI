import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Box, Typography, Link } from '@mui/material';

interface MarkdownRendererProps {
  content: string;
}

// Using a more compatible type definition for ReactMarkdown components
type ComponentPropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>, 
  HTMLElement
> & { 
  node?: unknown; 
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Box sx={{ 
      '& pre': { 
        borderRadius: 1,
        p: 2,
        overflowX: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
      '& code': {
        fontFamily: 'monospace',
        p: 0.5,
        borderRadius: 0.5,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
      '& pre > code': {
        p: 0,
        backgroundColor: 'transparent',
      },
      '& blockquote': {
        borderLeft: '4px solid',
        borderColor: 'divider',
        pl: 2,
        ml: 0,
        my: 2,
      },
      '& img': {
        maxWidth: '100%',
        height: 'auto',
      },
      '& table': {
        borderCollapse: 'collapse',
        width: '100%',
        my: 2,
      },
      '& th, & td': {
        border: '1px solid',
        borderColor: 'divider',
        p: 1,
      },
      '& th': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        fontWeight: 'bold',
      }
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: (props) => <Typography variant="h4" gutterBottom {...props} />,
          h2: (props) => <Typography variant="h5" gutterBottom {...props} />,
          h3: (props) => <Typography variant="h6" gutterBottom {...props} />,
          h4: (props) => <Typography variant="subtitle1" gutterBottom {...props} />,
          h5: (props) => <Typography variant="subtitle2" gutterBottom {...props} />,
          h6: (props) => <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} gutterBottom {...props} />,
          p: (props) => <Typography variant="body1" paragraph {...props} />,
          a: (props) => <Link color="primary" {...props} />,
          code: ({ inline, className, children, ...rest }: ComponentPropsType) => {
            if (inline) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            
            return (
              <pre className={className}>
                <code {...rest}>{children}</code>
              </pre>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
} 