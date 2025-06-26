import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function MessageBubble({ message, user }: { message: string; user: boolean }) {
  return (
    <div className={`flex w-full mt-[20px] ${user ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-2xl px-4 py-3 max-w-[60%] break-words ${
        user ? 'bg-[#2d7cfb] text-white' : 'bg-[#f5f5f5] text-[#333]'
      }`}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            code({node, inline, className, children, ...props}) {
              return (
                <code className={`${className} bg-gray-200 max-w-[50px] p-1 rounded`} {...props}>
                  {children}
                </code>
              );
            }
          }}>
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
}