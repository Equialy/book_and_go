// Утилиты для работы с localStorage (оставляем как fallback)
class AppointmentStorage {
  static getAppointments() {
    const appointments = localStorage.getItem("appointments")
    return appointments ? JSON.parse(appointments) : this.getDefaultAppointments()
  }

  static saveAppointments(appointments) {
    localStorage.setItem("appointments", JSON.stringify(appointments))
  }

  static addAppointment(appointment) {
    const appointments = this.getAppointments()
    const newAppointment = {
      id: this.generateId(),
      ...appointment,
      createdAt: new Date().toISOString(),
    }
    appointments.push(newAppointment)
    this.saveAppointments(appointments)
    return newAppointment
  }

  static deleteAppointment(id) {
    const appointments = this.getAppointments()
    const filtered = appointments.filter((app) => app.id !== id)
    this.saveAppointments(filtered)
  }

  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  static getDefaultAppointments() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return [
      {
        id: "1",
        name: "Иван Петров",
        email: "ivan@example.com",
        phone: "+7 (999) 123-45-67",
        service: "Консультация",
        date: tomorrow.toISOString().split("T")[0],
        time: "10:00",
        notes: "Первичная консультация",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Анна Сидорова",
        email: "anna@example.com",
        phone: "+7 (999) 987-65-43",
        service: "Стрижка",
        date: dayAfterTomorrow.toISOString().split("T")[0],
        time: "14:00",
        notes: "",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Петр Иванов",
        email: "petr@example.com",
        phone: "+7 (999) 555-55-55",
        service: "Массаж",
        date: yesterday.toISOString().split("T")[0],
        time: "16:00",
        notes: "Спортивный массаж",
        createdAt: new Date().toISOString(),
      },
    ]
  }
}

// Утилиты для уведомлений
class Toast {
  static show(message, type = "success") {
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toastMessage")

    if (!toast || !toastMessage) return

    toastMessage.textContent = message
    toast.className = `toast ${type}`
    toast.classList.remove("hidden")

    // Показать toast
    setTimeout(() => {
      toast.classList.add("show")
    }, 100)

    // Скрыть toast через 4 секунды
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        toast.classList.add("hidden")
      }, 300)
    }, 4000)
  }
}

// Утилиты для загрузки
class LoadingOverlay {
  static show() {
    const overlay = document.getElementById("loadingOverlay")
    if (overlay) {
      overlay.classList.remove("hidden")
    }
  }

  static hide() {
    const overlay = document.getElementById("loadingOverlay")
    if (overlay) {
      overlay.classList.add("hidden")
    }
  }
}

// Утилиты для форматирования даты
class DateUtils {
  static formatDate(dateString) {
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Moscow",
    }
    return date.toLocaleDateString("ru-RU", options)
  }

  static isUpcoming(dateString) {
    const appointmentDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointmentDate >= today
  }
}

// Валидация формы
class FormValidator {
  static validateAppointment(data) {
    const errors = []

    if (!data.name || data.name.length < 3 || data.name.length > 255) {
      errors.push("Имя должно содержать от 3 до 255 символов")
    }

    if (!data.email || data.email.length < 3 || data.email.length > 255) {
      errors.push("Email должен содержать от 3 до 255 символов")
    }

    if (!data.phone || data.phone.length < 3 || data.phone.length > 11) {
      errors.push("Телефон должен содержать от 3 до 11 символов")
    }

    if (!data.service || data.service.length < 3 || data.service.length > 255) {
      errors.push("Выберите услугу")
    }

    if (!data.date) {
      errors.push("Выберите дату")
    }

    if (!data.time) {
      errors.push("Выберите время")
    }

    if (data.notes && data.notes.length > 255) {
      errors.push("Дополнительная информация не должна превышать 255 символов")
    }

    // Проверка даты (не в прошлом)
    if (data.date) {
      const selectedDate = new Date(data.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        errors.push("Нельзя выбрать дату в прошлом")
      }
    }

    return errors
  }
}

// Обработка формы записи с API
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm")

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const submitBtn = document.getElementById("submitBtn")
      const formData = new FormData(bookingForm)

      // Показать состояние загрузки
      submitBtn.disabled = true
      submitBtn.textContent = "Отправка..."

      try {
        const appointmentData = {
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          date: formData.get("date"),
          time: formData.get("time"),
          notes: formData.get("notes") || "",
        }

        // Валидация на клиенте
        const validationErrors = FormValidator.validateAppointment(appointmentData)
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join("; "))
        }

        // Отправка данных на API
        const response = await window.AppointmentsAPI.create(appointmentData)

        console.log("Запись создана:", response)

        // Сохраняем также локально как backup
        AppointmentStorage.addAppointment({
          ...appointmentData,
          id: response.id || Date.now(),
        })

        Toast.show("Запись успешно создана! Мы свяжемся с вами в ближайшее время.", "success")

        // Перенаправление на страницу успеха через 2 секунды
        setTimeout(() => {
          window.location.href = "/success"
        }, 2000)
      } catch (error) {
        console.error("Ошибка при создании записи:", error)

        const errorMessage = window.ApiErrorHandler.getErrorMessage(error)
        Toast.show(errorMessage, "error")

        // Восстанавливаем кнопку
        submitBtn.disabled = false
        submitBtn.textContent = "Записаться"
      }
    })
  }
})

// Обработка панели управления с API
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard")) {
    loadDashboard()
    setupTabs()
  }
})

async function loadDashboard() {
  try {
    // Пытаемся загрузить данные с API
    const appointments = await window.AppointmentsAPI.getAll()

    // Разделить записи на предстоящие и прошедшие
    const upcoming = appointments.filter((app) => DateUtils.isUpcoming(app.date))
    const past = appointments.filter((app) => !DateUtils.isUpcoming(app.date))

    // Обновить статистику
    updateStats(appointments.length, upcoming.length, past.length)

    // Загрузить списки записей
    setTimeout(() => {
      loadAppointmentsList("upcoming", upcoming)
      loadAppointmentsList("past", past)
    }, 800)
  } catch (error) {
    console.error("Ошибка загрузки данных с API:", error)

    // Fallback на локальные данные
    Toast.show("Не удается загрузить данные с сервера. Показаны локальные данные.", "error")

    const localAppointments = AppointmentStorage.getAppointments()
    const upcoming = localAppointments.filter((app) => DateUtils.isUpcoming(app.date))
    const past = localAppointments.filter((app) => !DateUtils.isUpcoming(app.date))

    updateStats(localAppointments.length, upcoming.length, past.length)

    setTimeout(() => {
      loadAppointmentsList("upcoming", upcoming)
      loadAppointmentsList("past", past)
    }, 800)
  }
}

function updateStats(total, upcoming, past) {
  const totalElement = document.getElementById("totalAppointments")
  const upcomingElement = document.getElementById("upcomingAppointments")
  const pastElement = document.getElementById("pastAppointments")

  if (totalElement) totalElement.textContent = total
  if (upcomingElement) upcomingElement.textContent = upcoming
  if (pastElement) pastElement.textContent = past
}

function loadAppointmentsList(type, appointments) {
  const listElement = document.getElementById(`${type}List`)
  const loadingElement = document.getElementById(`loading${type.charAt(0).toUpperCase() + type.slice(1)}`)

  if (!listElement) return

  // Скрыть загрузку
  if (loadingElement) {
    loadingElement.style.display = "none"
  }

  if (appointments.length === 0) {
    listElement.innerHTML = `
            <div class="empty-state">
                <p>У вас нет ${type === "upcoming" ? "предстоящих" : "прошедших"} записей</p>
                ${type === "upcoming" ? '<a href="/booking" class="btn btn-primary">Создать запись</a>' : ""}
            </div>
        `
    return
  }

  listElement.innerHTML = appointments
      .map((appointment) => createAppointmentCard(appointment, type === "past"))
      .join("")

  // Добавить обработчики для кнопок удаления
  listElement.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const appointmentId = this.dataset.id
      deleteAppointment(appointmentId)
    })
  })
}

function createAppointmentCard(appointment, isPast = false) {
  return `
        <div class="appointment-card">
            <div class="appointment-info">
                <div class="appointment-header">
                    <span class="badge ${isPast ? "badge-outline" : "badge-default"}">${appointment.service}</span>
                    <span class="appointment-date">${DateUtils.formatDate(appointment.date)} в ${appointment.time}</span>
                </div>
                
                <h3 class="appointment-name">${appointment.name}</h3>
                
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>${appointment.email}</span>
                    </div>
                    <div class="appointment-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>${appointment.time}</span>
                    </div>
                </div>
                
                ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ""}
            </div>
            
            <button class="delete-btn" data-id="${appointment.id}" title="Удалить">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                </svg>
            </button>
        </div>
    `
}

function setupTabs() {
  const tabTriggers = document.querySelectorAll(".tab-trigger")
  const tabContents = document.querySelectorAll(".tab-content")

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const targetTab = this.dataset.tab

      // Удалить активные классы
      tabTriggers.forEach((t) => t.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      // Добавить активные классы
      this.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

async function deleteAppointment(id) {
  if (confirm("Вы уверены, что хотите удалить эту запись?")) {
    try {
      // Пытаемся удалить через API
      await window.AppointmentsAPI.delete(id)
      Toast.show("Запись удалена")
    } catch (error) {
      console.error("Ошибка удаления через API:", error)
      // Fallback на локальное удаление
      AppointmentStorage.deleteAppointment(id)
      Toast.show("Запись удалена локально")
    }

    loadDashboard() // Перезагрузить данные
  }
}

// Обработка навигации
document.addEventListener("DOMContentLoaded", () => {
  // Подсветка активной страницы в навигации
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const navLinks = document.querySelectorAll(".nav-link")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    const hrefPage = href.split("/").pop()
    if (hrefPage === currentPage || (currentPage === "" && hrefPage === "index.html")) {
      link.classList.add("active")
    }
  })
})
