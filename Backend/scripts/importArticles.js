/**
 * Script to import sample articles into MongoDB
 * Run: node scripts/importArticles.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

// Sample Articles Data
const articles = [
  {
    title: '5 Cách Giảm Nguy Cơ Tiểu Đường Tự Nhiên',
    excerpt: 'Tìm hiểu chế độ ăn uống và thói quen giúp bạn duy trì đường huyết ổn định và phòng ngừa tiểu đường hiệu quả.',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1599814516324-66aa0bf16425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWFiZXRlcyUyMHByZXZlbnRpb258ZW58MXx8fHwxNzYyODU0MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    readTime: '8 phút đọc',
    featured: true,
    author: {
      name: 'Dr. Nguyễn Thị Mai',
      title: 'Bác sĩ Nội tiết',
      avatar: 'https://images.unsplash.com/photo-1758691463626-0ab959babe00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2Mjc1NTg1N3ww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    publishDate: '2025-11-05',
    views: 12543,
    content: {
      introduction: 'Bệnh tiểu đường type 2 đang trở thành một trong những vấn đề sức khỏe phổ biến nhất trên toàn cầu. May mắn thay, nhiều nghiên cứu khoa học đã chứng minh rằng chúng ta có thể giảm đáng kể nguy cơ mắc bệnh thông qua những thay đổi đơn giản trong lối sống hàng ngày. Dưới đây là 5 cách tự nhiên và hiệu quả được các chuyên gia y tế khuyến nghị.',
      sections: [
        {
          title: '1. Kiểm soát cân nặng và giảm mỡ thừa',
          content: [
            'Thừa cân và béo phì là yếu tố nguy cơ hàng đầu gây ra bệnh tiểu đường type 2. Khi cơ thể tích tụ quá nhiều mỡ, đặc biệt là mỡ bụng, các tế bào trở nên kháng insulin - tức là không phản ứng đúng cách với hormone này.',
            'Nghiên cứu cho thấy việc giảm chỉ 5-7% trọng lượng cơ thể có thể làm giảm nguy cơ tiểu đường lên đến 58%. Điều này có nghĩa nếu bạn nặng 80kg, việc giảm 4-5.6kg đã có thể mang lại lợi ích đáng kể.',
            'Để giảm cân hiệu quả và lâu dài, hãy kết hợp chế độ ăn cân đối với vận động thường xuyên. Tránh các chế độ ăn kiêng quá khắt khe vì chúng khó duy trì lâu dài và có thể gây hại cho sức khỏe.'
          ],
          image: 'https://images.unsplash.com/photo-1556911073-a517e752729c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2MTI4Nzc5MXww&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          title: '2. Tăng cường hoạt động thể chất',
          content: [
            'Vận động thể dục đều đặn giúp cơ thể sử dụng insulin hiệu quả hơn, từ đó kiểm soát đường huyết tốt hơn. Các nghiên cứu khuyến nghị ít nhất 150 phút hoạt động vừa phải mỗi tuần, tương đương khoảng 30 phút mỗi ngày.',
            'Bạn không cần phải tập luyện quá cường độ. Các hoạt động như đi bộ nhanh, bơi lội, đạp xe, hoặc thậm chí làm vườn đều có thể mang lại lợi ích. Quan trọng là sự kiên trì và đều đặn.',
            'Ngoài ra, tập luyện sức mạnh (như nâng tạ nhẹ) 2-3 lần mỗi tuần có thể giúp tăng khối lượng cơ, từ đó cải thiện khả năng kiểm soát đường huyết của cơ thể.'
          ],
          image: 'https://images.unsplash.com/photo-1634144646738-809a0f8897c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVyY2lzZSUyMGZpdG5lc3MlMjBoZWFsdGh8ZW58MXx8fHwxNzYxMzkwNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          title: '3. Chọn thực phẩm giàu chất xơ và ít đường',
          content: [
            'Chế độ ăn đóng vai trò cực kỳ quan trọng trong việc phòng ngừa tiểu đường. Hãy ưu tiên các thực phẩm giàu chất xơ như rau xanh, trái cây, ngũ cốc nguyên hạt, và đậu. Chất xơ giúp làm chậm quá trình hấp thụ đường, giữ đường huyết ổn định.',
            'Hạn chế tối đa đường tinh luyện và carbohydrate đơn giản. Điều này bao gồm nước ngọt có gas, bánh ngọt, kẹo, và thực phẩm chế biến sẵn. Thay vào đó, chọn carbohydrate phức hợp như gạo lứt, yến mạch, và khoai lang.',
            'Đặc biệt chú ý đến đồ uống - nhiều người tiêu thụ quá nhiều đường qua nước ngọt, trà sữa, và cà phê có đường. Thay thế bằng nước lọc, trà không đường, hoặc nước chanh tươi.'
          ],
          image: 'https://images.unsplash.com/photo-1621485099116-dfc893e4f31d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHBsYW5uaW5nfGVufDF8fHx8MTc2Mjg1NDI3M3ww&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          title: '4. Quản lý căng thẳng và ngủ đủ giấc',
          content: [
            'Stress mãn tính khiến cơ thể tiết ra các hormone như cortisol và adrenaline, làm tăng đường huyết. Học cách quản lý căng thẳng thông qua thiền định, yoga, hít thở sâu, hoặc các hoạt động thư giãn khác.',
            'Thiếu ngủ cũng ảnh hưởng nghiêm trọng đến khả năng kiểm soát đường huyết. Người lớn nên ngủ 7-9 giờ mỗi đêm. Thiếu ngủ làm tăng hormone gây đói (ghrelin) và giảm hormone báo no (leptin), khiến bạn ăn nhiều hơn.',
            'Hãy xây dựng thói quen ngủ tốt: đi ngủ và thức dậy cùng giờ mỗi ngày, tránh màn hình điện tử trước khi ngủ 1-2 giờ, và tạo môi trường ngủ thoải mái, tối và mát mẻ.'
          ]
        },
        {
          title: '5. Tránh hút thuốc và hạn chế rượu bia',
          content: [
            'Hút thuốc lá làm tăng đáng kể nguy cơ mắc bệnh tiểu đường type 2 và các biến chứng liên quan. Nicotine làm giảm hiệu quả của insulin và gây viêm trong cơ thể.',
            'Nếu bạn đang hút thuốc, việc bỏ thuốc là một trong những quyết định quan trọng nhất bạn có thể làm cho sức khỏe. Tham khảo bác sĩ về các chương trình cai thuốc hiệu quả.',
            'Về rượu bia, nếu sử dụng thì nên uống vừa phải: không quá 1 ly/ngày với phụ nữ và 2 ly/ngày với nam giới. Rượu bia có thể làm tăng cân và ảnh hưởng đến đường huyết, đặc biệt khi uống nhiều.'
          ]
        }
      ],
      conclusion: 'Phòng ngừa bệnh tiểu đường không đòi hỏi những thay đổi quá lớn hay khó khăn. Bằng cách áp dụng từng thay đổi tích cực, dù nhỏ, cũng đóng góp vào sức khỏe lâu dài của bạn. Nếu bạn có yếu tố nguy cơ cao, hãy tham khảo bác sĩ để được tư vấn và theo dõi định kỳ.',
      highlight: 'Theo nghiên cứu của WHO và các tổ chức y tế quốc tế, thay đổi lối sống có thể giảm đến 58% nguy cơ mắc bệnh tiểu đường type 2. Đây là con số ấn tượng cho thấy chúng ta có quyền kiểm soát sức khỏe của mình.'
    }
  },
  {
    title: 'Tầm quan trọng của xét nghiệm HbA1c trong theo dõi tiểu đường',
    excerpt: 'HbA1c là chỉ số quan trọng giúp đánh giá mức đường huyết trung bình trong 3 tháng.',
    category: 'testing',
    imageUrl: 'https://images.unsplash.com/photo-1576169210859-6796c4b93c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVzdCUyMGRpYWJldGVzfGVufDF8fHx8MTc2MTM5MDc4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    readTime: '4 phút đọc',
    featured: true,
    publishDate: '2025-11-10',
    views: 8932
  },
  {
    title: 'Vận động thể dục: Vũ khí mạnh trong phòng ngừa tiểu đường',
    excerpt: '30 phút tập luyện mỗi ngày có thể giảm đáng kể nguy cơ mắc bệnh tiểu đường type 2.',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1634144646738-809a0f8897c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVyY2lzZSUyMGZpdG5lc3MlMjBoZWFsdGh8ZW58MXx8fHwxNzYxMzkwNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    readTime: '6 phút đọc',
    featured: true,
    publishDate: '2025-11-15',
    views: 10254
  },
  {
    title: 'Hiểu về Insulin và vai trò của nó trong cơ thể',
    excerpt: 'Insulin là hormone quan trọng giúp điều hòa lượng đường trong máu.',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1606206873764-fd15e242df52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjEzODc4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    readTime: '7 phút đọc',
    featured: false,
    publishDate: '2025-11-20',
    views: 6721
  },
  {
    title: 'Chế độ ăn Low-Carb: Có phù hợp với bệnh tiểu đường?',
    excerpt: 'Phân tích lợi ích và rủi ro của chế độ ăn giảm carbohydrate đối với người tiểu đường.',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1556911073-a517e752729c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2MTI4Nzc5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    readTime: '5 phút đọc',
    featured: false,
    publishDate: '2025-11-25',
    views: 5432
  },
  {
    title: 'Stress và tiểu đường: Mối liên hệ bạn cần biết',
    excerpt: 'Căng thẳng kéo dài có thể ảnh hưởng trực tiếp đến mức đường huyết của bạn.',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1758691462123-8a17ae95d203?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXRpZW50JTIwbWVkaWNhbHxlbnwxfHx8fDE3NjEzOTA3ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    readTime: '4 phút đọc',
    featured: false,
    publishDate: '2025-11-28',
    views: 4892
  }
];

async function importArticles() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://nguyenhuy0701:y23866MIcUyzzsYZ@cluster0-myhealthmate.cs4pcnh.mongodb.net/?retryWrites=true&w=majority');
  
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(process.env.DATABASE_NAME || 'diabetes_prediction');
    const articlesCollection = db.collection('articles');

    // Clear existing articles
    console.log('🗑️  Clearing existing articles...');
    await articlesCollection.deleteMany({});
    console.log('✅ Cleared existing articles');

    // Add timestamps to articles
    const articlesWithTimestamps = articles.map(article => ({
      ...article,
      publishDate: new Date(article.publishDate),
      _destroy: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert new articles
    console.log('📝 Importing articles...');
    const result = await articlesCollection.insertMany(articlesWithTimestamps);
    console.log(`✅ Successfully imported ${result.insertedCount} articles`);

    // Display imported articles
    console.log('\n📊 Imported Articles:');
    const imported = await articlesCollection.find({}).toArray();
    imported.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.category})`);
    });

    console.log('\n🎉 Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing articles:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the import
importArticles();
