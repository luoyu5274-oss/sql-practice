import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function LessonContent({ lesson }) {
  if (!lesson) return null

  return (
    <div className="lesson-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className
            if (isInline) {
              return <code {...props}>{children}</code>
            }
            return (
              <pre>
                <code className={className} {...props}>{children}</code>
              </pre>
            )
          },
        }}
      >
        {lesson.content || '# 暂无内容'}
      </ReactMarkdown>
    </div>
  )
}
