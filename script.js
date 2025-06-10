// Утилиты для работы с localStorage
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
        // Тестовые данные

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

        // Скрыть toast через 3 секунды
        setTimeout(() => {
            toast.classList.remove("show")
            setTimeout(() => {
                toast.classList.add("hidden")
            }, 300)
        }, 3000)
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

// Обработка формы записи
document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm")

    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const submitBtn = document.getElementById("submitBtn")
            const formData = new FormData(bookingForm)

            // Показать состояние загрузки
            submitBtn.disabled = true
            submitBtn.textContent = "Отправка..."

            // Имитация отправки формы
            setTimeout(() => {
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

                    // Валидация
                    if (
                        !appointmentData.name ||
                        !appointmentData.email ||
                        !appointmentData.phone ||
                        !appointmentData.service ||
                        !appointmentData.date ||
                        !appointmentData.time
                    ) {
                        throw new Error("Пожалуйста, заполните все обязательные поля")
                    }

                    // Сохранить запись
                    AppointmentStorage.addAppointment(appointmentData)

                    // Перенаправить на страницу успешной записи
                    window.location.href = "success.html"
                } catch (error) {
                    Toast.show(error.message, "error")
                    submitBtn.disabled = false
                    submitBtn.textContent = "Записаться"
                }
            }, 1000)
        })
    }
})

// Обработка панели управления
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        loadDashboard()
        setupTabs()
    }
})

function loadDashboard() {
    const appointments = AppointmentStorage.getAppointments()

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
                ${type === "upcoming" ? '<a href="booking.html" class="btn btn-primary">Создать запись</a>' : ""}
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

function deleteAppointment(id) {
    if (confirm("Вы уверены, что хотите удалить эту запись?")) {
        AppointmentStorage.deleteAppointment(id)
        Toast.show("Запись удалена")
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
        if (href === currentPage || (currentPage === "" && href === "index.html")) {
            link.classList.add("active")
        }
    })
})
