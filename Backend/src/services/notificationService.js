// ============================================
// IMPORT CÁC MODULE CẦN THIẾT
// ============================================
import { notificationModel } from '~/models' // Model xử lý database
import ApiError from '~/utils/ApiError' // Class tạo lỗi API
import { StatusCodes } from 'http-status-codes' // HTTP status codes chuẩn

// ============================================
// NOTIFICATION SERVICE - BUSINESS LOGIC LAYER
// ============================================
/**
 * Service Layer - Lớp xử lý logic nghiệp vụ
 * 
 * Nhiệm vụ:
 * - Nhận request từ Controller
 * - Xử lý logic nghiệp vụ (validation, transform data, etc.)
 * - Gọi Model để thao tác với database
 * - Trả kết quả về cho Controller
 * 
 * Tại sao cần Service Layer?
 * - Tách biệt logic nghiệp vụ khỏi Controller (Controller chỉ xử lý HTTP)
 * - Dễ dàng tái sử dụng logic ở nhiều nơi
 * - Dễ test (không phụ thuộc vào HTTP request/response)
 */

/**
 * createNotification - Tạo thông báo mới
 * 
 * @param {Object} notificationData - Dữ liệu thông báo
 * @returns {Promise<Object>} - Thông báo vừa tạo (bao gồm _id)
 * 
 * Flow:
 * 1. Gọi model.createNew() để insert vào database
 * 2. Lấy lại thông báo vừa tạo từ database (để có đầy đủ thông tin)
 * 3. Trả về thông báo đầu tiên (mới nhất)
 * 
 * Lưu ý: Hàm này thường được gọi từ:
 * - Socket.IO server (khi có sự kiện cần thông báo)
 * - Prediction service (sau khi dự đoán xong)
 * - Chat service (khi có tin nhắn mới)
 */
const createNotification = async (notificationData) => {
  try {
    // Insert vào database
    const result = await notificationModel.createNew(notificationData)

    // Lấy lại thông báo vừa tạo (để có đầy đủ thông tin như _id, createdAt)
    const newNotification = await notificationModel.findByUserId(notificationData.userId, 1)

    // Trả về thông báo đầu tiên
    return newNotification[0]
  } catch (error) {
    throw error
  }
}

/**
 * getMyNotifications - Lấy danh sách thông báo của user hiện tại
 * 
 * @param {string} userId - ID của user
 * @returns {Promise<Array>} - Danh sách thông báo (tối đa 50 thông báo)
 * 
 * Đặc điểm:
 * - Chỉ lấy thông báo chưa bị xóa (_destroy: false)
 * - Sắp xếp theo thời gian tạo (mới nhất trước)
 * - Giới hạn 50 thông báo
 * 
 * Được gọi khi:
 * - User mở panel thông báo
 * - Cần refresh danh sách thông báo
 */
const getMyNotifications = async (userId) => {
  try {
    const notifications = await notificationModel.findByUserId(userId, 50)
    return notifications
  } catch (error) {
    throw error
  }
}

/**
 * getUnreadCount - Lấy số lượng thông báo chưa đọc
 * 
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Object chứa { count: number }
 * 
 * Dùng để:
 * - Hiển thị badge số thông báo chưa đọc trên icon
 * - Update realtime khi có thông báo mới
 * 
 * Được gọi:
 * - Khi user login
 * - Định kỳ để cập nhật badge
 * - Sau khi đánh dấu đã đọc/xóa thông báo
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await notificationModel.countUnreadByUserId(userId)
    return { count }
  } catch (error) {
    throw error
  }
}

/**
 * markNotificationAsRead - Đánh dấu một thông báo là đã đọc
 * 
 * @param {string} notificationId - ID của thông báo
 * @param {string} userId - ID của user (để bảo mật)
 * @returns {Promise<Object>} - { success: true }
 * @throws {ApiError} - Nếu không tìm thấy thông báo (404)
 * 
 * Bảo mật:
 * - Phải truyền userId để đảm bảo user chỉ đánh dấu thông báo của mình
 * - Nếu notificationId không thuộc về userId, sẽ không update được
 * 
 * Được gọi khi:
 * - User click vào một thông báo
 * - User hover vào thông báo (tùy UX)
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const result = await notificationModel.markAsRead(notificationId, userId)

    // Kiểm tra xem có update được không
    if (result.matchedCount === 0) {
      // matchedCount = 0 nghĩa là không tìm thấy document nào khớp điều kiện
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found')
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}

/**
 * markAllNotificationsAsRead - Đánh dấu TẤT CẢ thông báo là đã đọc
 * 
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - { success: true }
 * 
 * Chức năng:
 * - Đánh dấu tất cả thông báo chưa đọc của user thành đã đọc
 * - Chỉ update những thông báo có isRead = false
 * 
 * Được gọi khi:
 * - User click nút "Đánh dấu tất cả đã đọc"
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    await notificationModel.markAllAsRead(userId)
    return { success: true }
  } catch (error) {
    throw error
  }
}

/**
 * deleteNotification - Xóa một thông báo (soft delete)
 * 
 * @param {string} notificationId - ID của thông báo
 * @param {string} userId - ID của user (để bảo mật)
 * @returns {Promise<Object>} - { success: true }
 * @throws {ApiError} - Nếu không tìm thấy thông báo (404)
 * 
 * Lưu ý:
 * - Đây là SOFT DELETE (đánh dấu _destroy = true)
 * - Thông báo vẫn còn trong database, chỉ bị ẩn
 * - Có thể khôi phục lại nếu cần
 * 
 * Bảo mật:
 * - User chỉ xóa được thông báo của mình
 * 
 * Được gọi khi:
 * - User click nút xóa trên một thông báo
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const result = await notificationModel.deleteNotification(notificationId, userId)

    // Kiểm tra xem có xóa được không
    if (result.matchedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found')
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}

// ============================================
// EXPORT SERVICE
// ============================================

/**
 * notificationService - Export tất cả các hàm service
 * 
 * Các hàm:
 * - createNotification: Tạo thông báo mới
 * - getMyNotifications: Lấy danh sách thông báo
 * - getUnreadCount: Đếm số thông báo chưa đọc
 * - markNotificationAsRead: Đánh dấu một thông báo đã đọc
 * - markAllNotificationsAsRead: Đánh dấu tất cả đã đọc
 * - deleteNotification: Xóa thông báo
 */
export const notificationService = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
}

export default notificationService

