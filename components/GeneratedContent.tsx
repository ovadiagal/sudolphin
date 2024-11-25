import React from 'react';

interface GeneratedItem {
  fileName: string;
  content: string;
}

interface GeneratedContentProps {
  title: string;
  items: GeneratedItem[];
  selectedIndex: number | null;
  onItemSelect: (index: number | null) => void;
  colorClass: string;
}

export const GeneratedContent: React.FC<GeneratedContentProps> = ({
  title,
  items,
  selectedIndex,
  onItemSelect,
  colorClass,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          <ul className="list-disc pl-5">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  className={`hover:underline ${colorClass}`}
                  onClick={() => onItemSelect(index)}
                >
                  {item.fileName} - {title} {index + 1}
                </button>
              </li>
            ))}
          </ul>

          {selectedIndex !== null && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-semibold">
                  {items[selectedIndex].fileName} - {title} {selectedIndex + 1}
                </h4>
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => onItemSelect(null)}
                >
                  &times;
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{items[selectedIndex].content}</pre>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4">No {title.toLowerCase()} generated yet</p>
      )}
    </div>
  );
};
