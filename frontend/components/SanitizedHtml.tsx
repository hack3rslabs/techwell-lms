import DOMPurify from 'isomorphic-dompurify';
import React from 'react';

interface SanitizedHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
    html: string;
}

export const SanitizedHtml: React.FC<SanitizedHtmlProps> = ({ html, ...props }) => {
    const cleanHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe'], // Allow iframes for youtube embeds etc if needed
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });

    return <div {...props} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cleanHtml) }} />;
};
