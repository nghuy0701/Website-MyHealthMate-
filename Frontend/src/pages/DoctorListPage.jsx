import React, { useState, useEffect } from 'react'
import styles from './DoctorListPage.module.css'

const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [loading, setLoading] = useState(false)

  const SPECIALTIES = [
    'all',
    'Tổng quát',
    'Nội tiết',
    'Tim mạch',
    'Dinh dưỡng',
    'Thận',
    'Mắt',
    'Thần kinh'
  ]

  useEffect(() => {
    fetchDoctors()
  }, [selectedSpecialty])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const url =
        selectedSpecialty === 'all'
          ? `${import.meta.env.VITE_API_URL}/api/v1/chat/doctors`
          : `${import.meta.env.VITE_API_URL}/api/v1/chat/doctors/search?specialty=${selectedSpecialty}`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setDoctors(data.data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectDoctor = async (doctorUserId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/doctors/connect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ doctorUserId })
        }
      )

      const data = await response.json()
      if (response.ok) {
        alert(data.data.message)
        // Navigate to chat with doctor
        // window.location.href = `/chat/${data.data.conversation._id}`
      }
    } catch (error) {
      console.error('Error connecting to doctor:', error)
    }
  }

  return (
    <div className={styles.doctorListContainer}>
      <div className={styles.header}>
        <h1>👨‍⚕️ Tìm bác sĩ tư vấn</h1>
        <p>Chọn chuyên khoa hoặc bác sĩ mà bạn quan tâm</p>
      </div>

      <div className={styles.specialtyFilter}>
        {SPECIALTIES.map(specialty => (
          <button
            key={specialty}
            className={`${styles.specialtyBtn} ${
              selectedSpecialty === specialty ? styles.active : ''
            }`}
            onClick={() => setSelectedSpecialty(specialty)}
          >
            {specialty}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <div className={styles.doctorGrid}>
          {doctors.map(doctor => (
            <div key={doctor._id} className={styles.doctorCard}>
              <div className={styles.doctorHeader}>
                <div className={styles.avatar}>
                  {doctor.user?.avatar ? (
                    <img src={doctor.user.avatar} alt={doctor.user.fullName} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {doctor.user?.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.statusBadge}>
                  {doctor.isAvailable ? (
                    <span className={styles.available}>Có sẵn</span>
                  ) : (
                    <span className={styles.unavailable}>Không có sẵn</span>
                  )}
                </div>
              </div>

              <h3>{doctor.user?.fullName}</h3>
              <p className={styles.specialty}>{doctor.specialty}</p>

              <div className={styles.bio}>{doctor.bio}</div>

              <div className={styles.rating}>
                <span className={styles.stars}>⭐ {doctor.rating?.toFixed(1) || 0}/5</span>
                <span className={styles.count}>({doctor.totalRatings} đánh giá)</span>
              </div>

              <div className={styles.hours}>
                <small>🕒 Giờ hỗ trợ: {doctor.consultationHours.start}:00 - {doctor.consultationHours.end}:00</small>
              </div>

              <button
                className={styles.connectBtn}
                onClick={() => handleConnectDoctor(doctor.userId)}
                disabled={!doctor.isAvailable}
              >
                {doctor.isAvailable ? 'Kết nối ngay' : 'Ngoài giờ hỗ trợ'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div className={styles.emptyState}>
          <p>Không tìm thấy bác sĩ nào trong chuyên khoa này</p>
        </div>
      )}
    </div>
  )
}

export default DoctorListPage
