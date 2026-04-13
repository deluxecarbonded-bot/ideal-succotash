'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types';
import { HeartIcon, ReplyIcon, ShareIcon, TrashIcon, MoreIcon } from './Icons';

interface QuestionCardProps {
  question: Question;
  onLike?: (id: string) => void;
  onReply?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (question: Question) => void;
  showAnswer?: boolean;
  onAnswer?: (id: string, answer: string) => void;
  canDelete?: boolean;
  canAnswer?: boolean;
}

export default function QuestionCard({
  question,
  onLike,
  onReply,
  onDelete,
  onShare,
  showAnswer = true,
  onAnswer,
  canDelete = false,
  canAnswer = false,
}: QuestionCardProps) {
  const [liked, setLiked] = useState(question.is_liked || false);
  const [likesCount, setLikesCount] = useState(question.likes_count);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike?.(question.id);
  };

  const handleSubmitAnswer = () => {
    if (answerText.trim()) {
      onAnswer?.(question.id, answerText);
      setShowAnswerForm(false);
      setAnswerText('');
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid rgba(128,128,128,0.15)'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {question.is_anonymous ? (
            <p className="text-sm opacity-50">Anonymous</p>
          ) : (
            <p className="text-sm opacity-50">{question.author?.username || 'User'}</p>
          )}
          <p className="mt-1 text-lg" style={{ color: 'var(--text-primary)' }}>
            {question.content}
          </p>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg opacity-50 hover:opacity-100"
            style={{ color: 'var(--text-primary)' }}
          >
            <MoreIcon />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-full mt-1 py-2 rounded-lg min-w-[120px] z-10"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid rgba(128,128,128,0.2)'
                }}
              >
                {onShare && (
                  <button
                    onClick={() => {
                      onShare?.(question);
                      setShowShareSuccess(true);
                      setShowMenu(false);
                      setTimeout(() => setShowShareSuccess(false), 2000);
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <ShareIcon className="w-4 h-4" />
                    Share
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowConfirmDelete(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:opacity-80"
                    style={{ color: '#ef4444' }}
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showAnswer && question.is_answered && question.answer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pl-4 border-l-2"
          style={{ borderColor: 'rgba(128,128,128,0.3)' }}
        >
          <p className="text-base" style={{ color: 'var(--text-primary)' }}>
            {question.answer}
          </p>
        </motion.div>
      )}

      {!question.is_answered && canAnswer && (
        <div className="mt-3">
          {!showAnswerForm ? (
            <motion.button
              onClick={() => setShowAnswerForm(true)}
              className="text-sm opacity-60 hover:opacity-100"
              style={{ color: 'var(--text-primary)' }}
              whileTap={{ scale: 0.95 }}
            >
              Write an answer...
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your answer..."
                className="w-full p-3 rounded-xl text-base resize-none"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(128,128,128,0.2)'
                }}
                rows={3}
              />
              <div className="flex gap-2">
                <motion.button
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'var(--btn-bg)', 
                    color: 'var(--btn-text)' 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Answer
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowAnswerForm(false);
                    setAnswerText('');
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium opacity-60 hover:opacity-100"
                  style={{ color: 'var(--text-primary)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4">
        <motion.button
          onClick={handleLike}
          className="flex items-center gap-1"
          whileTap={{ scale: 0.9 }}
        >
          <HeartIcon filled={liked} className={liked ? '' : ''} style={{ color: liked ? '#ef4444' : 'var(--text-primary)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{likesCount}</span>
        </motion.button>

        {onReply && (
          <motion.button
            onClick={() => onReply(question.id)}
            className="flex items-center gap-1 opacity-60 hover:opacity-100"
            whileTap={{ scale: 0.9 }}
            style={{ color: 'var(--text-primary)' }}
          >
            <ReplyIcon />
          </motion.button>
        )}

         {onShare && (
           <motion.button
             onClick={() => {
               onShare?.(question);
               setShowShareSuccess(true);
               setTimeout(() => setShowShareSuccess(false), 2000);
             }}
             className="flex items-center gap-1 opacity-60 hover:opacity-100"
             whileTap={{ scale: 0.9 }}
             style={{ color: 'var(--text-primary)' }}
           >
             <ShareIcon />
           </motion.button>
         )}

        <span className="text-sm ml-auto opacity-50" style={{ color: 'var(--text-primary)' }}>
          {formatDate(question.created_at)}
        </span>
      </div>

      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <p className="mb-3" style={{ color: 'var(--text-primary)' }}>Delete this question?</p>
            <div className="flex gap-2">
              <motion.button
                onClick={() => {
                  onDelete?.(question.id);
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm Delete
              </motion.button>
              <motion.button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium opacity-60 hover:opacity-100"
                style={{ color: 'var(--text-primary)' }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl z-50"
            style={{ backgroundColor: 'var(--btn-bg)', color: 'var(--btn-text)' }}
          >
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
