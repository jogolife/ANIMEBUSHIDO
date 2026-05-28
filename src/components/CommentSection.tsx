import React, { useState } from "react";
import { MessageSquare, Send, ThumbsUp, Sparkles, User, ShieldCheck } from "lucide-react";
import { Comment } from "../types";

interface CommentSectionProps {
  animeId: string;
  comments: Comment[];
  onSubmitComment: (commentText: string) => void;
  onLikeComment: (commentId: string) => void;
  currentUser: {
    uid: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
}

export default function CommentSection({ 
  animeId, 
  comments, 
  onSubmitComment, 
  onLikeComment,
  currentUser
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError("O comentário não pode ser em branco.");
      return;
    }
    setError("");
    onSubmitComment(newComment);
    setNewComment("");
  };

  const getRoleBadge = (comment: Comment) => {
    // Determine badges based on usernames in pre-seeded items
    const lowerName = comment.userName.toLowerCase();
    
    if (lowerName.includes("admin")) {
      return (
        <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
          <ShieldCheck className="h-2.5 w-2.5" />
          Admin
        </span>
      );
    }
    
    if (comment.isVip || lowerName.includes("goku") || lowerName.includes("vip")) {
      return (
        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
          <Sparkles className="h-2.5 w-2.5 text-amber-400" />
          VIP Otaku
        </span>
      );
    }

    return (
      <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider">
        Fã
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="mt-8 border-t border-zinc-800/80 pt-6">
      <h3 className="font-display font-bold text-xl text-white flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-purple-400" />
        Comentários da Comunidade ({comments.length})
      </h3>

      {/* FORM TO ADD A NEW COMMENT */}
      <form onSubmit={handleSubmit} className="mb-8" id={`comment-form-${animeId}`}>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus-within:border-zinc-700 transition-all">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-purple-950/40 border border-purple-900/35 flex items-center justify-center text-purple-400 text-xs font-mono">
              {getInitials(currentUser.name)}
            </div>
            <span className="text-zinc-300 font-medium text-xs">
              Comentando como: <strong className="text-purple-400">{currentUser.name}</strong>
            </span>
            {currentUser.role !== "user" && (
              <span className={`text-[10px] uppercase font-mono tracking-wider font-bold px-1 rounded ${
                currentUser.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-300"
              }`}>
                [{currentUser.role}]
              </span>
            )}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              if (error) setError("");
            }}
            placeholder="Escreva seu comentário sobre o anime... (Dicas, Teorias, Reviews ou Críticas!)"
            className="w-full bg-[#0a0a0a] text-zinc-200 placeholder-zinc-550 text-xs p-3.5 rounded-lg border border-zinc-800 hover:border-zinc-700 outline-none resize-none h-24 transition-all focus:border-zinc-650"
            maxLength={1000}
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-zinc-500 font-mono">
              {newComment.length}/1000 caracteres
            </span>
            
            <button
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 text-[10px] font-mono uppercase tracking-wider font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-all outline-none"
              id="comment-submit-btn"
            >
              <Send className="h-3 w-3" />
              Enviar Comentário
            </button>
          </div>
        </div>
        
        {error && (
          <p className="text-rose-400 text-xs mt-2 text-mono italic">
            ⚠️ {error}
          </p>
        )}
      </form>

      {/* COMMENTS LIST */}
      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2" id="comments-list">
        {comments.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
            Ainda não há comentários sobre este anime. Seja o primeiro a opinar!
          </div>
        ) : (
          comments.map((comment, index) => {
            const dateStr = new Date(comment.createdAt).toLocaleDateString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const isTopComment = comment.likes >= 10;

            return (
              <div 
                key={comment.id}
                className={`p-4 rounded-xl border transition-all ${
                  isTopComment 
                    ? "bg-zinc-900 border-zinc-800 shadow" 
                    : "bg-zinc-950 border-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {/* User profile identifier initials */}
                    <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-850 font-mono text-zinc-300 font-bold text-xs flex items-center justify-center">
                      {getInitials(comment.userName)}
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-xs text-zinc-200">
                          {comment.userName}
                        </span>
                        {getRoleBadge(comment)}
                      </div>
                      
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Top Comment Pin Decoration */}
                  {isTopComment && (
                    <span className="text-[10px] bg-yellow-400/10 text-yellow-500 border border-yellow-400/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
                      🔥 Destaque
                    </span>
                  )}
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed pl-1 pb-1 whitespace-pre-wrap">
                  {comment.comment}
                </p>

                {/* LIKE TRIGGER */}
                <div className="flex items-center justify-end border-t border-zinc-800/40 mt-2.5 pt-2">
                  <button
                    onClick={() => onLikeComment(comment.id)}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-purple-400 transition-colors text-xs font-bold outline-none"
                    id={`like-comment-${comment.id}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
