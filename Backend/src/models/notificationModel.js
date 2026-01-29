// ============================================
// IMPORT CÁC THƯ VIỆN CẦN THIẾT
// ============================================
import Joi from 'joi' // Thư viện validation dữ liệu
import { ObjectId } from 'mongodb' // Class để làm việc với MongoDB ObjectId
import { GET_DB } from '~/configs/mongodb' // Hàm lấy database instance

// ============================================
// CONSTANTS - CÁC HẰNG SỐ
// ============================================

// Tên collection trong MongoDB
const COLLECTION_NAME = 'notifications'

/**
 * NOTIFICATION_TYPES - Các loại thông báo trong hệ thống
 * 
 * - CHAT: Thông báo tin nhắn mới từ cuộc trò chuyện
 * - PREDICTION: Thông báo kết quả dự đoán bệnh tiểu đường
 * - REMINDER: Thông báo nhắc nhở (ví dụ: nhắc kiểm tra sức khỏe)
 * - ALERT: Thông báo cảnh báo khẩn cấp (ví dụ: nguy cơ cao)
 * - ARTICLE: Thông báo bài viết mới
 */
const NOTIFICATION_TYPES = {
  CHAT: 'chat',
  PREDICTION: 'prediction',
  REMINDER: 'reminder',
  ALERT: 'alert',
  ARTICLE: 'article'
}

/**
 * USER_ROLES - Các vai trò người dùng
 * 
 * Dùng để phân quyền hiển thị thông báo:
 * - DOCTOR: Bác sĩ (nhận thông báo về bệnh nhân)
 * - PATIENT: Bệnh nhân (nhận thông báo về sức khỏe của mình)
 */
const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient'
}

/**
 * NOTIFICATION_COLLECTION_SCHEMA - Schema validation cho thông báo
 * 
 * Định nghĩa cấu trúc dữ liệu của một thông báo trong database:
 * 
 * @property {string} userId - ID của người nhận thông báo (bắt buộc)
 * @property {string} type - Loại thông báo (chat/prediction/reminder/alert/article) (bắt buộc)
 * @property {string} title - Tiêu đề thông báo, tối đa 200 ký tự (bắt buộc)
 * @property {string} description - Nội dung chi tiết, tối đa 500 ký tự (bắt buộc)
 * @property {boolean} isRead - Trạng thái đã đọc/chưa đọc (mặc định: false)
 * @property {string} role - Vai trò người dùng được xem (doctor/patient) (tùy chọn)
 * @property {object} deepLink - Thông tin điều hướng khi click vào thông báo (tùy chọn)
 *   - pathname: Đường dẫn trang cần chuyển đến (ví dụ: '/chat', '/prediction/123')
 *   - query: Các tham số URL (ví dụ: { tab: 'messages' })
 * @property {object} meta - Metadata bổ sung (tùy chọn)
 *   - conversationId: ID cuộc trò chuyện (cho thông báo chat)
 *   - senderId: ID người gửi tin nhắn
 *   - senderName: Tên người gửi
 *   - predictionId: ID kết quả dự đoán
 *   - articleId: ID bài viết
 * @property {number} createdAt - Timestamp tạo thông báo (tự động)
 * @property {boolean} _destroy - Đánh dấu đã xóa (soft delete) (mặc định: false)
 */
const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
  title: Joi.string().required().max(200),
  description: Joi.string().required().max(500),
  isRead: Joi.boolean().default(false),
  role: Joi.string().valid(...Object.values(USER_ROLES)).optional(), // Role-based visibility
  deepLink: Joi.object({
    pathname: Joi.string().required(),
    query: Joi.object().optional()
  }).optional(), // Deep linking info
  meta: Joi.object({
    conversationId: Joi.string(),
    senderId: Joi.string(),
    senderName: Joi.string(),
    predictionId: Joi.string(),
    articleId: Joi.string()
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

// ============================================
// VALIDATION FUNCTIONS - HÀM KIỂM TRA DỮ LIỆU
// ============================================

/**
 * validateBeforeCreate - Kiểm tra tính hợp lệ của dữ liệu trước khi tạo thông báo
 * 
 * @param {Object} data - Dữ liệu thông báo cần validate
 * @returns {Promise<Object>} - Dữ liệu đã được validate và chuẩn hóa
 * @throws {Error} - Nếu dữ liệu không hợp lệ
 * 
 * Ví dụ:
 * - Kiểm tra userId có tồn tại không
 * - Kiểm tra type có thuộc danh sách cho phép không
 * - Kiểm tra title không vượt quá 200 ký tự
 */
const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// ============================================
// DATABASE OPERATIONS - CÁC THAO TÁC VỚI DATABASE
// ============================================

/**
 * createNew - Tạo thông báo mới trong database
 * 
 * @param {Object} data - Dữ liệu thông báo
 * @returns {Promise<Object>} - Kết quả insert từ MongoDB
 * 
 * Quy trình:
 * 1. Validate dữ liệu đầu vào
 * 2. Chuyển đổi userId từ string sang ObjectId
 * 3. Chuyển đổi các ID trong meta (conversationId, senderId, predictionId, articleId) sang ObjectId
 * 4. Insert vào database
 * 
 * Ví dụ data:
 * {
 *   userId: '507f1f77bcf86cd799439011',
 *   type: 'prediction',
 *   title: 'Kết quả dự đoán',
 *   description: 'Nguy cơ tiểu đường của bạn ở mức trung bình',
 *   meta: { predictionId: '507f1f77bcf86cd799439012' }
 * }
 */
const createNew = async (data) => {
  try {
    // Bước 1: Validate dữ liệu
    const validData = await validateBeforeCreate(data)

    // Bước 2: Chuẩn bị object thông báo mới
    const newNotification = {
      ...validData,
      userId: new ObjectId(validData.userId), // Chuyển userId sang ObjectId
      createdAt: Date.now() // Thêm timestamp hiện tại
    }

    // Bước 3: Chuyển đổi các ID trong meta sang ObjectId (nếu có)
    if (newNotification.meta) {
      // Chuyển conversationId (cho thông báo chat)
      if (newNotification.meta.conversationId) {
        newNotification.meta.conversationId = new ObjectId(newNotification.meta.conversationId)
      }
      // Chuyển senderId (ID người gửi tin nhắn)
      if (newNotification.meta.senderId) {
        newNotification.meta.senderId = new ObjectId(newNotification.meta.senderId)
      }
      // Chuyển predictionId (ID kết quả dự đoán)
      if (newNotification.meta.predictionId) {
        newNotification.meta.predictionId = new ObjectId(newNotification.meta.predictionId)
      }
      // Chuyển articleId (ID bài viết)
      if (newNotification.meta.articleId) {
        newNotification.meta.articleId = new ObjectId(newNotification.meta.articleId)
      }
    }

    // Bước 4: Insert vào database
    const result = await GET_DB().collection(COLLECTION_NAME).insertOne(newNotification)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * findByUserId - Lấy danh sách thông báo của một user
 * 
 * @param {string} userId - ID của user
 * @param {number} limit - Số lượng thông báo tối đa (mặc định: 50)
 * @returns {Promise<Array>} - Danh sách thông báo
 * 
 * Quy trình:
 * 1. Tìm tất cả thông báo của userId
 * 2. Chỉ lấy thông báo chưa bị xóa (_destroy: false)
 * 3. Sắp xếp theo thời gian tạo (mới nhất trước)
 * 4. Giới hạn số lượng kết quả
 */
const findByUserId = async (userId, limit = 50) => {
  try {
    const notifications = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        userId: new ObjectId(userId), // Tìm theo userId
        _destroy: false // Chỉ lấy thông báo chưa xóa
      })
      .sort({ createdAt: -1 }) // Sắp xếp: mới nhất trước (-1 = descending)
      .limit(limit) // Giới hạn số lượng
      .toArray() // Chuyển cursor thành array

    return notifications
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * countUnreadByUserId - Đếm số lượng thông báo chưa đọc của user
 * 
 * @param {string} userId - ID của user
 * @returns {Promise<number>} - Số lượng thông báo chưa đọc
 * 
 * Điều kiện đếm:
 * - Thuộc về userId
 * - isRead = false (chưa đọc)
 * - _destroy = false (chưa bị xóa)
 * 
 * Dùng để hiển thị badge số thông báo chưa đọc trên icon
 */
const countUnreadByUserId = async (userId) => {
  try {
    const count = await GET_DB()
      .collection(COLLECTION_NAME)
      .countDocuments({
        userId: new ObjectId(userId), // Của user này
        isRead: false, // Chưa đọc
        _destroy: false // Chưa xóa
      })
    return count
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * markAsRead - Đánh dấu một thông báo là đã đọc
 * 
 * @param {string} notificationId - ID của thông báo
 * @param {string} userId - ID của user (để bảo mật, chỉ user sở hữu mới đánh dấu được)
 * @returns {Promise<Object>} - Kết quả update từ MongoDB
 * 
 * Điều kiện update:
 * - _id khớp với notificationId
 * - userId khớp (đảm bảo user chỉ đánh dấu thông báo của mình)
 * - _destroy = false (thông báo chưa bị xóa)
 * 
 * Thao tác: Set isRead = true
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(notificationId), // Tìm theo ID thông báo
          userId: new ObjectId(userId), // Đảm bảo thuộc về user này
          _destroy: false // Chưa bị xóa
        },
        {
          $set: { isRead: true } // Đặt isRead = true
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * markAllAsRead - Đánh dấu TẤT CẢ thông báo của user là đã đọc
 * 
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Kết quả update từ MongoDB (có thuộc tính modifiedCount)
 * 
 * Điều kiện update:
 * - Thuộc về userId
 * - isRead = false (chỉ update những thông báo chưa đọc)
 * - _destroy = false (chưa bị xóa)
 * 
 * Dùng khi user click nút "Đánh dấu tất cả đã đọc"
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateMany( // updateMany để update nhiều document cùng lúc
        {
          userId: new ObjectId(userId), // Của user này
          isRead: false, // Chỉ update những thông báo chưa đọc
          _destroy: false // Chưa xóa
        },
        {
          $set: { isRead: true } // Đặt tất cả isRead = true
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * deleteNotification - Xóa một thông báo (soft delete)
 * 
 * @param {string} notificationId - ID của thông báo
 * @param {string} userId - ID của user (để bảo mật)
 * @returns {Promise<Object>} - Kết quả update từ MongoDB
 * 
 * Lưu ý: Đây là SOFT DELETE
 * - Không xóa thật khỏi database
 * - Chỉ đánh dấu _destroy = true
 * - Thông báo sẽ bị ẩn khỏi danh sách hiển thị
 * - Có thể khôi phục lại nếu cần
 * 
 * Điều kiện:
 * - _id khớp với notificationId
 * - userId khớp (user chỉ xóa được thông báo của mình)
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(notificationId), // Tìm theo ID
          userId: new ObjectId(userId) // Đảm bảo thuộc về user này
        },
        {
          $set: { _destroy: true } // Đánh dấu đã xóa (soft delete)
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// ============================================
// EXPORT - XUẤT CÁC HÀM VÀ CONSTANTS
// ============================================

/**
 * notificationModel - Export tất cả các hàm và constants
 * 
 * Constants:
 * - COLLECTION_NAME: Tên collection trong MongoDB
 * - NOTIFICATION_TYPES: Các loại thông báo
 * - USER_ROLES: Các vai trò người dùng
 * 
 * Functions:
 * - createNew: Tạo thông báo mới
 * - findByUserId: Lấy danh sách thông báo của user
 * - countUnreadByUserId: Đếm số thông báo chưa đọc
 * - markAsRead: Đánh dấu một thông báo đã đọc
 * - markAllAsRead: Đánh dấu tất cả đã đọc
 * - deleteNotification: Xóa thông báo (soft delete)
 */
export const notificationModel = {
  COLLECTION_NAME,
  NOTIFICATION_TYPES,
  USER_ROLES,
  createNew,
  findByUserId,
  countUnreadByUserId,
  markAsRead,
  markAllAsRead,
  deleteNotification
}
