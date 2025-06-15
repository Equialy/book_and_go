// Утилиты для уведомлений
class Toast {
    static show(message, type = "success") {
        // Создаем toast элемент если его нет
        let toast = document.getElementById("toast")
        if (!toast) {
            toast = document.createElement("div")
            toast.id = "toast"
            toast.className = "toast hidden"
            toast.innerHTML = `
        <div class="toast-content">
          <span id="toastMessage"></span>
          <button class="toast-close" onclick="Toast.hide()">&times;</button>
        </div>
      `
            document.body.appendChild(toast)
        }

        const toastMessage = document.getElementById("toastMessage")
        if (!toastMessage) return

        toastMessage.textContent = message
        toast.className = `toast ${type}`
        toast.classList.remove("hidden")

        // Показать toast
        setTimeout(() => {
            toast.classList.add("show")
        }, 100)

        // Скрыть toast через 5 секунд
        setTimeout(() => {
            Toast.hide()
        }, 5000)
    }

    static hide() {
        const toast = document.getElementById("toast")
        if (toast) {
            toast.classList.remove("show")
            setTimeout(() => {
                toast.classList.add("hidden")
            }, 300)
        }
    }
}

// Утилиты для загрузки
class LoadingOverlay {
    static show(message = "Загрузка...") {
        let overlay = document.getElementById("loadingOverlay")
        if (!overlay) {
            overlay = document.createElement("div")
            overlay.id = "loadingOverlay"
            overlay.className = "loading-overlay hidden"
            overlay.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p id="loadingMessage">${message}</p>
        </div>
      `
            document.body.appendChild(overlay)
        }

        const loadingMessage = document.getElementById("loadingMessage")
        if (loadingMessage) {
            loadingMessage.textContent = message
        }

        overlay.classList.remove("hidden")
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

    static getTodayString() {
        const today = new Date()
        return today.toISOString().split("T")[0]
    }

    static getMaxDateString() {
        const maxDate = new Date()
        maxDate.setMonth(maxDate.getMonth() + 2)
        return maxDate.toISOString().split("T")[0]
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

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }
}

// Утилиты для работы с localStorage (fallback)
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

// Экспортируем для глобального использования
window.Toast = Toast
window.LoadingOverlay = LoadingOverlay
window.DateUtils = DateUtils
window.FormValidator = FormValidator
window.AppointmentStorage = AppointmentStorage
