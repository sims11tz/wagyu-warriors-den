import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Trophy } from "lucide-react";
import warriorAvatar from "@/assets/warrior-avatar.jpg";

const mockPosts = [
  {
    id: 1,
    author: "SteakSensei47",
    avatar: warriorAvatar,
    tier: "Founding Warrior",
    timeAgo: "2h ago",
    caption: "Perfect A5 Wagyu ribeye - 2 minutes each side, finished with herb butter. The marbling speaks for itself. 🥩",
    tags: ["#A5Wagyu", "#ReverseSear", "#PerfectCut"],
    likes: 147,
    comments: 23,
    score: 967,
    image: "/placeholder-steak.jpg"
  },
  {
    id: 2,
    author: "Blademaster_Tokyo", 
    avatar: warriorAvatar,
    tier: "Member",
    timeAgo: "4h ago", 
    caption: "Dry-aged strip steak challenge completed. 28 days of patience rewarded with incredible depth of flavor.",
    tags: ["#DryAged", "#StripSteak", "#28Days"],
    likes: 89,
    comments: 12,
    score: 845,
    image: "/placeholder-steak.jpg"
  },
];

export const ChefsTable: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Chef's Table</h2>
            <p className="text-sm text-muted-foreground">Share your culinary mastery</p>
          </div>
          <Button variant="warrior" size="sm">
            Create Post
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <div key={post.id} className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover border-2 border-warrior-gold"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-foreground">{post.author}</h4>
                  <Badge variant="outline" className="border-warrior-gold/50 text-warrior-gold text-xs">
                    {post.tier}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy size={14} className="text-warrior-gold" />
                <span className="text-sm font-semibold text-warrior-gold">{post.score}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <div className="w-full h-48 bg-warrior-leather/20 rounded-lg mb-3 flex items-center justify-center border border-warrior-smoke/30">
                <span className="text-muted-foreground text-sm">Culinary Masterpiece</span>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed mb-3">
                {post.caption}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-warrior-ember/50 text-warrior-ember bg-warrior-ember/10 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-warrior-smoke/30">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    likedPosts.has(post.id) 
                      ? "text-warrior-ember" 
                      : "text-muted-foreground hover:text-warrior-ember"
                  }`}
                >
                  <Heart
                    size={16}
                    className={likedPosts.has(post.id) ? "fill-current" : ""}
                  />
                  <span className="text-sm">
                    {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                  </span>
                </button>

                <button className="flex items-center space-x-2 text-muted-foreground hover:text-warrior-gold transition-colors">
                  <MessageCircle size={16} />
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="warrior-ghost" size="sm">
                  Challenge Me
                </Button>
                <button className="text-muted-foreground hover:text-warrior-gold transition-colors">
                  <Share size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="warrior-outline" size="lg">
          Load More Posts
        </Button>
      </div>
    </div>
  );
};