// ============================================
// IMPORT CÁC MODULE CẦN THIẾT
// ============================================
import { StatusCodes } from 'http-status-codes' // HTTP status codes chuẩn
import { notificationService } from '~/services/notificationService' // Service xử lý logic
import ApiError from '~/utils/ApiError' // Class tạo lỗi API

// ============================================
// NOTIFICATION CONTROLLER - HTTP REQUEST HANDLER
// ============================================
/**
 * Controller Layer - Lớp xử lý HTTP requests
 * 
 * Nhiệm vụ:
 * - Nhận HTTP request từ client
 * - Lấy dữ liệu từ request (params, query, body, session)
 * - Gọi Service để xử lý logic nghiệp vụ
 * - Trả HTTP response về cho client
 * - Xử lý lỗi (chuyển sang error handler middleware)
 * 
 * Kiến trúc MVC:
 * Client -> Route -> Controller -> Service -> Model -> Database
 *                                    ↓
 *                                 Response
 */

/**
 * getMyNotifications - API lấy danh sách thông báo của user hiện tại
 * 
 * Route: GET /api/v1/notifications
 * Auth: Required (phải đăng nhập)
 * 
 * @param {Object} req - Express request object
 *   - req.session.user.userId: ID của user đang đăng nhập
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * 
 * Response Success (200):
 * {
 *   message: 'Get notifications successfully',
 *   data: [
 *     {
 *       id: '507f1f77bcf86cd799439011',
 *       type: 'prediction',
 *       title: 'Kết quả dự đoán',
 *       description: 'Nguy cơ tiểu đường của bạn ở mức trung bình',
 *       isRead: false,
 *       createdAt: 1706789012345,
 *       ...
 *     }
 *   ]
 * }
 * 
 * Response Error (401):
 * - Nếu user chưa đăng nhập
 */
const getMyNotifications = async (req, res, next) => {
  try {
    // Lấy userId từ session (được set khi user login)
    const userId = req.session.user?.userId

    // Kiểm tra xem user đã đăng nhập chưa
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    // Gọi service để lấy danh sách thông báo
    const notifications = await notificationService.getMyNotifications(userId)

    // Trả về response thành công
    res.status(StatusCodes.OK).json({
      message: 'Get notifications successfully',
      data: notifications
    })
  } catch (error) {
    // Chuyển lỗi sang error handler middleware
    next(error)
  }
}

/**
 * getUnreadCount - API lấy số lượng thông báo chưa đọc
 * 
 * Route: GET /api/v1/notifications/unread-count
 * Auth: Required
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * 
 * Response Success (200):
 * {
 *   message: 'Get unread count successfully',
 *   data: { count: 5 }
 * }
 * 
 * Dùng để:
 * - Hiển thị badge số thông báo chưa đọc trên icon
 * - Cập nhật realtime khi có thông báo mới
 */
const getUnreadCount = async (req, res, next) => {
  try {
    // Lấy userId từ session
    const userId = req.session.user?.userId

    // Kiểm tra authentication
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    // Gọi service để đếm số thông báo chưa đọc
    const result = await notificationService.getUnreadCount(userId)

    // Trả về response
    res.status(StatusCodes.OK).json({
      message: 'Get unread count successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * markAsRead - API đánh dấu một thông báo là đã đọc
 * 
 * Route: PATCH /api/v1/notifications/:id/read
 * Auth: Required
 * 
 * @param {Object} req - Express request
 *   - req.params.id: ID của thông báo cần đánh dấu
 *   - req.session.user.userId: ID của user
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * 
 * Response Success (200):
 * {
 *   message: 'Notification marked as read',
 *   data: { success: true }
 * }
 * 
 * Response Error (404):
 * - Nếu không tìm thấy thông báo
 * - Hoặc thông báo không thuộc về user này
 */
const markAsRead = async (req, res, next) => {
  try {
    // Lấy userId từ session
    const userId = req.session.user?.userId

    // Kiểm tra authentication
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    // Lấy notificationId từ URL params
    const { id } = req.params

    // Gọi service để đánh dấu đã đọc
    await notificationService.markNotificationAsRead(id, userId)

    // Trả về response thành công
    res.status(StatusCodes.OK).json({
      message: 'Notification marked as read',
      data: { success: true }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * markAllAsRead - API đánh dấu TẤT CẢ thông báo là đã đọc
 * 
 * Route: PATCH /api/v1/notifications/read-all
 * Auth: Required
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * 
 * Response Success (200):
 * {
 *   message: 'All notifications marked as read',
 *   data: { success: true }
 * }
 * 
 * Được gọi khi:
 * - User click nút "Đánh dấu tất cả đã đọc"
 */
const markAllAsRead = async (req, res, next) => {
  try {
    // Lấy userId từ session
    const userId = req.session.user?.userId

    // Kiểm tra authentication
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    // Gọi service để đánh dấu tất cả đã đọc
    await notificationService.markAllNotificationsAsRead(userId)

    // Trả về response thành công
    res.status(StatusCodes.OK).json({
      message: 'All notifications marked as read',
      data: { success: true }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * deleteNotification - API xóa một thông báo
 * 
 * Route: DELETE /api/v1/notifications/:id
 * Auth: Required
 * 
 * @param {Object} req - Express request
 *   - req.params.id: ID của thông báo cần xóa
 *   - req.session.user.userId: ID của user
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * 
 * Response Success (200):
 * {
 *   message: 'Notification deleted',
 *   data: { success: true }
 * }
 * 
 * Response Error (404):
 * - Nếu không tìm thấy thông báo
 * - Hoặc thông báo không thuộc về user này
 * 
 * Lưu ý:
 * - Đây là SOFT DELETE (đánh dấu _destroy = true)
 * - Thông báo vẫn còn trong database
 */
const deleteNotification = async (req, res, next) => {
  try {
    // Lấy userId từ session
    const userId = req.session.user?.userId

    // Kiểm tra authentication
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    // Lấy notificationId từ URL params
    const { id } = req.params

    // Gọi service để xóa thông báo
    await notificationService.deleteNotification(id, userId)

    // Trả về response thành công
    res.status(StatusCodes.OK).json({
      message: 'Notification deleted',
      data: { success: true }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// EXPORT CONTROLLER
// ============================================

/**
 * notificationController - Export tất cả các handler functions
 * 
 * Các API endpoints:
 * - getMyNotifications: GET /api/v1/notifications
 * - getUnreadCount: GET /api/v1/notifications/unread-count
 * - markAsRead: PATCH /api/v1/notifications/:id/read
 * - markAllAsRead: PATCH /api/v1/notifications/read-all
 * - deleteNotification: DELETE /api/v1/notifications/:id
 */
export const notificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
}

