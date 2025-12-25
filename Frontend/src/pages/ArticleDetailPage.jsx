import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { categoryLabels } from '../lib/data';
import { articleAPI } from '../lib/api';
import { getCommentsByArticleId } from '../lib/comments-data';
import { useAuth } from '../lib/auth-context';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
    ArrowLeft,
    Clock,
    Eye,
    Calendar,
    Heart,
    Share2,
    Bookmark,
    ThumbsUp,
    Send,
    Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ArticleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [likedComments, setLikedComments] = useState(new Set());
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch article and comments data when id changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await articleAPI.getById(id);
                const art = response.data;
                
                // Parse content if it's a JSON string
                if (art.content && typeof art.content === 'string') {
                    try {
                        art.content = JSON.parse(art.content);
                    } catch (e) {
                        console.error('Failed to parse article content:', e);
                        art.content = null;
                    }
                }
                
                setArticle(art);

                if (art) {
                    // Fetch all articles to find related ones
                    const allArticlesResponse = await articleAPI.getAll();
                    const allArticles = allArticlesResponse.data;
                    const related = allArticles
                        .filter(a => a.category === art.category && a._id !== art._id)
                        .slice(0, 3);
                    setRelatedArticles(related);
                } else {
                    setRelatedArticles([]);
                }

                const comms = await getCommentsByArticleId(id);
                setComments(comms);
            } catch (error) {
                toast.error('Không thể tải bài viết: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmitComment = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để bình luận');
            navigate('/login');
            return;
        }

        if (!newComment.trim()) {
            toast.error('Vui lòng nhập nội dung bình luận');
            return;
        }

        const comment = {
            id: Date.now().toString(),
            articleId: article._id,
            userId: user._id || user.id,
            userName: user.name,
            userAvatar: user.avatar,
            content: newComment,
            timestamp: new Date().toISOString(),
            likes: 0,
        };

        setComments([comment, ...comments]);
        setNewComment('');
        toast.success('Đã đăng bình luận!');
    };

    const handleLikeComment = (commentId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thích bình luận');
            return;
        }

        const newLiked = new Set(likedComments);
        if (newLiked.has(commentId)) {
            newLiked.delete(commentId);
        } else {
            newLiked.add(commentId);
        }
        setLikedComments(newLiked);
    };

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '';
        return name
            .trim()
            .split(/\s+/)
            .map((n) => (n ? n[0] : ''))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const commentDate = new Date(timestamp);
        const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Vừa xong';
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        return formatDate(timestamp);
    };

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-gray-800 mb-4">Không tìm thấy bài viết</h2>
                    <Link to="/">
                        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                            Quay về trang chủ
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay về thư viện
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative h-96 md:h-[500px] overflow-hidden">
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-32 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Article Header Card */}
                    <Card className="p-8 md:p-12 rounded-3xl shadow-2xl mb-8 bg-white">
                        <Badge className="bg-green-600 mb-4">{categoryLabels[article.category] || article.category}</Badge>
                        <h1 className="text-gray-800 mb-6 text-3xl md:text-4xl lg:text-5xl">{article.title}</h1>

                        {/* Author and Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 mb-6">
                            {article.author && (
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarFallback className="bg-green-600 text-white">
                                            {getInitials(article.author.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-gray-800">{article.author.name}</div>
                                        <div className="text-sm text-gray-600">{article.author.title}</div>
                                    </div>
                                </div>
                            )}
                            <Separator orientation="vertical" className="h-12 hidden md:block" />
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {article.publishDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(article.publishDate)}
                                    </div>
                                )}
                                {article.views && (
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        {article.views.toLocaleString()} lượt xem
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {article.readTime}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button variant="outline" className="flex-1 md:flex-none">
                                <Heart className="w-4 h-4 mr-2" />
                                Yêu thích
                            </Button>
                            <Button variant="outline" className="flex-1 md:flex-none">
                                <Bookmark className="w-4 h-4 mr-2" />
                                Lưu
                            </Button>
                            <Button variant="outline" className="flex-1 md:flex-none">
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ
                            </Button>
                        </div>
                    </Card>

                    {/* Article Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <Card className="p-8 md:p-12 rounded-3xl shadow-lg">
                                {/* Introduction or Description */}
                                {article.content?.introduction ? (
                                    <div className="mb-8">
                                        <p className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-green-600 pl-6 py-2 bg-green-50/50">
                                            {article.content.introduction}
                                        </p>
                                    </div>
                                ) : article.description ? (
                                    <div className="mb-8">
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            {article.description}
                                        </p>
                                    </div>
                                ) : null}

                                {/* Sections */}
                                {article.content?.sections?.map((section, index) => (
                                    <div key={index} className="mb-12">
                                        <h2 className="text-gray-800 mb-4 text-2xl">{section.title}</h2>
                                        <div className="space-y-4">
                                            {section.content?.map((paragraph, pIndex) => (
                                                <p key={pIndex} className="text-gray-700 leading-loose">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                        {section.image && (
                                            <div className="mt-6 rounded-2xl overflow-hidden">
                                                <img
                                                    src={section.image}
                                                    alt={section.title}
                                                    className="w-full h-64 object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Highlight Box */}
                                {article.content?.highlight && (
                                    <Alert className="bg-blue-50 border-2 border-blue-200 mb-8">
                                        <Lightbulb className="h-5 w-5 text-blue-600" />
                                        <AlertDescription className="text-gray-800">
                                            <strong>Nghiên cứu khoa học:</strong> {article.content.highlight}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Conclusion */}
                                {article.content?.conclusion && (
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border-2 border-green-200">
                                        <h3 className="text-gray-800 mb-4 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-green-600" />
                                            Kết luận
                                        </h3>
                                        <p className="text-gray-700 leading-loose">{article.content.conclusion}</p>
                                    </div>
                                )}
                            </Card>

                            {/* Comments Section */}
                            <Card className="p-8 rounded-3xl shadow-lg mt-8">
                                <h3 className="text-gray-800 mb-6">
                                    Bình luận ({comments.length})
                                </h3>

                                {/* Comment Form */}
                                {user ? (
                                    <div className="mb-8">
                                        <div className="flex gap-4">
                                            <Avatar>
                                                {user?.avatar ? (
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                ) : (
                                                    <AvatarFallback className="bg-green-600 text-white">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="flex-1">
                                                <Textarea
                                                    placeholder="Chia sẻ suy nghĩ của bạn..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    className="mb-3 rounded-xl resize-none"
                                                    rows={3}
                                                />
                                                <Button
                                                    onClick={handleSubmitComment}
                                                    className="bg-green-600 hover:bg-green-700 rounded-xl"
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Gửi bình luận
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Alert className="mb-8 bg-blue-50 border-blue-200">
                                        <AlertDescription>
                                            <Link to="/login" className="text-green-600 hover:text-green-700 underline">
                                                Đăng nhập
                                            </Link>{' '}
                                            để tham gia thảo luận và chia sẻ ý kiến của bạn.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => {
                                        const isLiked = likedComments.has(comment.id);
                                        return (
                                            <div key={comment.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                                                <Avatar>
                                                    {comment.userAvatar ? (
                                                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                                    ) : (
                                                        <AvatarFallback className="bg-gray-300 text-gray-700">
                                                            {getInitials(comment.userName)}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-gray-800">{comment.userName}</span>
                                                        <span className="text-sm text-gray-500">
                                                            {formatTimeAgo(comment.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 mb-3">{comment.content}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleLikeComment(comment.id)}
                                                        className={`text-sm ${isLiked ? 'text-green-600' : 'text-gray-600'
                                                            } hover:text-green-600`}
                                                    >
                                                        <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-green-600' : ''}`} />
                                                        {comment.likes + (isLiked ? 1 : 0)}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar - Related Articles */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <h3 className="text-gray-800 mb-4">Có thể bạn quan tâm</h3>
                                <div className="space-y-4">
                                    {relatedArticles.map((relatedArticle) => (
                                        <Link key={relatedArticle._id} to={`/article/${relatedArticle._id}`}>
                                            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer rounded-2xl">
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={relatedArticle.imageUrl}
                                                        alt={relatedArticle.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                                        {categoryLabels[relatedArticle.category] || relatedArticle.category}
                                                    </Badge>
                                                    <h4 className="text-gray-800 line-clamp-2 mb-2 text-sm">
                                                        {relatedArticle.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        5 phút đọc
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                <Link to="/">
                                    <Button variant="outline" className="w-full mt-4 border-green-600 text-green-600 hover:bg-green-50 rounded-xl">
                                        Xem thêm bài viết
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
