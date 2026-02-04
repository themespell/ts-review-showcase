const renderEditorContent = (blocks) => {
    if (!Array.isArray(blocks)) return null;

    return blocks.map((block) => {
        switch (block.type) {
            case 'paragraph':
                return <p key={block.id} className="text-base mb-2">{block.data.text}</p>;
            case 'header':
                // Render headings based on their level
                const HeadingTag = `h${block.data.level}`;
                return (
                    <HeadingTag key={block.id} className={`text-${block.data.level}xl font-bold mb-2`}>
                        {block.data.text}
                    </HeadingTag>
                );
            case 'list':
                // Render unordered or ordered lists
                if (block.data.style === 'unordered') {
                    return (
                        <ul key={block.id} className="list-disc ml-5 mb-2">
                            {block.data.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    );
                } else if (block.data.style === 'ordered') {
                    return (
                        <ol key={block.id} className="list-decimal ml-5 mb-2">
                            {block.data.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                    );
                }
                break;
            default:
                return null; // Handle unsupported block types
        }
    });
};

export default renderEditorContent;