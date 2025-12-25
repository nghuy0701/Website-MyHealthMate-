import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { categoryLabels } from '../lib/data';
import { articleAPI } from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function KnowledgePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Fetch articles from backend
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articleAPI.getAll();
        setArticles(response.data);
      } catch (error) {
        toast.error('Không thể tải bài viết: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const featuredArticles = articles.filter((a) => a.featured);
  const currentFeatured = featuredArticles[featuredIndex];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && !article.featured;
  });

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredArticles.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-gray-800 mb-4">Hiểu đúng về bệnh tiểu đường – Bắt đầu từ kiến thức</h1>
          <p className="text-gray-600 text-lg mb-6">
            Cung cấp thông tin y khoa giúp bạn chủ động phòng ngừa và kiểm soát nguy cơ mắc bệnh tiểu đường.
          </p>
          {user ? (
            <Link to="/prediction">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Bắt đầu Dự đoán ngay
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Đăng ký để kiểm tra nguy cơ
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Featured Carousel */}
        {currentFeatured && <div className="relative max-w-5xl mx-auto mb-16">
          <Card className="overflow-hidden rounded-2xl shadow-lg">
            <div className="relative h-96">
              <img
                src={currentFeatured.imageUrl}
                alt={currentFeatured.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <Badge className="bg-green-600 mb-3">{categoryLabels[currentFeatured.category]}</Badge>
                <h2 className="text-white mb-3">{currentFeatured.title}</h2>
                <p className="text-white/90 mb-4">{currentFeatured.description}</p>
                <div className="flex items-center gap-4">
                  <Link to={`/article/${currentFeatured._id}`}>
                    <Button className="bg-white text-green-600 hover:bg-gray-100">Đọc ngay</Button>
                  </Link>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="w-4 h-4" />
                    5 phút đọc
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Carousel Controls */}
          <button
            onClick={prevFeatured}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={nextFeatured}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {featuredArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setFeaturedIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === featuredIndex ? 'bg-green-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>}

        {/* Filter and Search */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Tìm bài viết, ví dụ: HbA1c, insulin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Tất cả
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
                className={selectedCategory === key ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy bài viết phù hợp.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ArticleCard({ article }) {
  return (
    <Link to={`/article/${article._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group rounded-2xl">
        <div className="aspect-video overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5">
          <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-100">
            {categoryLabels[article.category]}
          </Badge>
          <h3 className="text-gray-800 mb-2 line-clamp-2">{article.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.description}</p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            5 phút đọc
          </div>
        </div>
      </Card>
    </Link>
  );
}
