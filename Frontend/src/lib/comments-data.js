// Simple mock comments for articles (plain JavaScript, no TypeScript types)
export const mockComments = [
    {
        id: '1',
        articleId: '1',
        userId: 'user1',
        userName: 'Trần Văn An',
        userAvatar: undefined,
        content: 'Bài viết rất hữu ích! Tôi đã áp dụng chế độ ăn giảm đường và cảm thấy sức khỏe được cải thiện nhiều. Cảm ơn bác sĩ đã chia sẻ!',
        timestamp: '2025-11-08T10:30:00',
        likes: 24,
    },
    {
        id: '2',
        articleId: '1',
        userId: 'user2',
        userName: 'Nguyễn Thị Hoa',
        userAvatar: undefined,
        content: 'Tôi muốn hỏi về phần vận động thể dục. Nếu tôi chỉ có thể dành 15-20 phút mỗi ngày thì có hiệu quả không ạ?',
        timestamp: '2025-11-08T14:15:00',
        likes: 8,
    },
    {
        id: '3',
        articleId: '1',
        userId: 'user3',
        userName: 'Lê Minh Tuấn',
        userAvatar: undefined,
        content: 'Gia đình tôi có tiền sử tiểu đường nên tôi rất quan tâm. Bài viết này giúp tôi hiểu rõ hơn cách phòng ngừa. Tôi sẽ chia sẻ với mọi người!',
        timestamp: '2025-11-09T09:00:00',
        likes: 15,
    },
    {
        id: '4',
        articleId: '1',
        userId: 'user4',
        userName: 'Phạm Thu Hương',
        userAvatar: undefined,
        content: 'Phần về quản lý stress rất đúng! Tôi nhận thấy khi căng thẳng thì cơ thể thèm ăn ngọt hơn. Bác sĩ có thể viết thêm về cách kiểm soát cơn thèm ăn không ạ?',
        timestamp: '2025-11-09T16:45:00',
        likes: 12,
    },
    {
        id: '5',
        articleId: '1',
        userId: 'user5',
        userName: 'Hoàng Văn Nam',
        userAvatar: undefined,
        content: 'Tôi đã bỏ thuốc được 3 tháng sau khi đọc các bài viết về sức khỏe. Cảm thấy tự tin hơn về việc phòng ngừa bệnh tật. Cảm ơn đội ngũ y tế!',
        timestamp: '2025-11-10T11:20:00',
        likes: 31,
    },
];

export function getCommentsByArticleId(articleId) {
    return mockComments.filter((c) => c.articleId === String(articleId));
}