'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SendIcon } from './Icons';

interface QuestionFormProps {
  recipientUsername?: string;
  onSubmit: (content: string, isAnonymous: boolean) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function QuestionForm({ 
  recipientUsername, 
  onSubmit, 
  placeholder = 'Ask a question...',
  loading = false
}: QuestionFormProps) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const maxLength = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, isAnonymous);
      setContent('');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="p-4 rounded-2xl"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid rgba(128,128,128,0.15)'
      }}
    >
      {recipientUsername && (
        <p className="mb-3 text-sm opacity-60" style={{ color: 'var(--text-primary)' }}>
          Ask @{recipientUsername}
        </p>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        disabled={loading}
        className="w-full p-3 rounded-xl text-base resize-none min-h-[100px]"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(128,128,128,0.2)'
        }}
      />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div 
              onClick={() => !loading && setIsAnonymous(!isAnonymous)} 
              className="relative w-12 h-6 rounded-full transition-colors duration-300"
              style={{ backgroundColor: isAnonymous ? 'var(--btn-bg)' : 'rgba(128, 128, 128, 0.2)' }}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full shadow-sm"
                style={{ 
                  backgroundColor: isAnonymous ? 'var(--btn-text)' : 'var(--text-primary)',
                  left: isAnonymous ? 'calc(100% - 20px)' : '4px'
                }} 
              />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {isAnonymous ? 'Anonymous' : 'Reveal Identity'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--text-primary)', opacity: content.length > maxLength * 0.8 ? 1 : 0.5 }}>
            {content.length}/{maxLength}
          </span>

          <motion.button
            type="submit"
            disabled={!content.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--btn-bg)', 
              color: 'var(--btn-text)' 
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <SendIcon />
            {loading ? 'Sending...' : 'Send'}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
