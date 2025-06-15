// Логика для панели управления
class DashboardPage {
    constructor() {
        this.appointments = []
        this.isLoading = false
        this.init()
    }

    init() {
        console.log("Initializing dashboard page...")

        this.setupTabs()
        this.loadAppointments()
    }

    setupTabs() {
        const tabTriggers = document.querySelectorAll(".tab-trigger")
        const tabContents = document.querySelectorAll(".tab-content")

        tabTriggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                const targetTab = trigger.dataset.tab

                // Удалить активные классы
                tabTriggers.forEach((t) => t.classList.remove("active"))
                tabContents.forEach((c) => c.classList.remove("active"))

                // Добавить активные классы
                trigger.classList.add("active")
                const targetContent = document.getElementById(targetTab)
                if (targetContent) {
                    targetContent.classList.add("active")
                }
            })
        })
    }

    async loadAppointments() {
        if (this.isLoading) return

        this.isLoading = true
        this.showLoading()

        try {
            console.log("Loading appointments from API...")

            // Пытаемся загрузить данные с API
            const apiAppointments = await window.AppointmentsAPI.getAll()

            // Преобразуем данные из API в нужный формат
            this.appointments = apiAppointments.map((item) => ({
                id: item.id.toString(),
                name: item.name,
                email: item.email,
                phone: item.phone,
                service: item.service,
                date: item.date,
                time: item.time,
                notes: item.notes || "",
            }))

            console.log("Loaded appointments from API:", this.appointments)
        } catch (error) {
            console.error("Error loading appointments from API:", error)

            // Fallback на локальные данные
            window.Toast.show("Не удается загрузить данные с сервера. Показаны локальные данные.", "error")
            this.appointments = window.AppointmentStorage.getAppointments()

            console.log("Using fallback appointments:", this.appointments)
        } finally {
            this.isLoading = false
            this.hideLoading()
            this.renderAppointments()
        }
    }

    showLoading() {
        const loadingElements = document.querySelectorAll(".loading")
        loadingElements.forEach((el) => (el.style.display = "block"))
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll(".loading")
        loadingElements.forEach((el) => (el.style.display = "none"))
    }

    renderAppointments() {
        // Разделить записи на предстоящие и прошедшие
        const upcoming = this.appointments.filter((app) => window.DateUtils.isUpcoming(app.date))
        const past = this.appointments.filter((app) => !window.DateUtils.isUpcoming(app.date))

        // Обновить статистику
        this.updateStats(this.appointments.length, upcoming.length, past.length)

        // Загрузить списки записей
        this.renderAppointmentsList("upcoming", upcoming)
        this.renderAppointmentsList("past", past)
    }

    updateStats(total, upcoming, past) {
        const totalElement = document.getElementById("totalAppointments")
        const upcomingElement = document.getElementById("upcomingAppointments")
        const pastElement = document.getElementById("pastAppointments")

        if (totalElement) totalElement.textContent = total
        if (upcomingElement) upcomingElement.textContent = upcoming
        if (pastElement) pastElement.textContent = past
    }

    renderAppointmentsList(type, appointments) {
        const listElement = document.getElementById(`${type}List`)
        if (!listElement) return

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
            .map((appointment) => this.createAppointmentCard(appointment, type === "past"))
            .join("")

        // Добавить обработчики для кнопок удаления
        listElement.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const appointmentId = btn.dataset.id
                this.deleteAppointment(appointmentId)
            })
        })
    }

    createAppointmentCard(appointment, isPast = false) {
        return `
      <div class="appointment-card">
        <div class="appointment-info">
          <div class="appointment-header">
            <span class="badge ${isPast ? "badge-outline" : "badge-default"}">${appointment.service}</span>
            <span class="appointment-date">${window.DateUtils.formatDate(appointment.date)} в ${appointment.time}</span>
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
              <span>${appointment.phone}</span>
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

    async deleteAppointment(id) {
        if (!confirm("Вы уверены, что хотите удалить эту запись?")) {
            return
        }

        try {
            console.log("Deleting appointment:", id)

            // Пытаемся удалить через API
            await window.AppointmentsAPI.delete(id)
            window.Toast.show("Запись удалена", "success")
        } catch (error) {
            console.error("Error deleting appointment via API:", error)

            // Fallback на локальное удаление
            window.AppointmentStorage.deleteAppointment(id)
            window.Toast.show("Запись удалена локально", "success")
        }

        // Обновляем список записей
        this.appointments = this.appointments.filter((app) => app.id !== id)
        this.renderAppointments()
    }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".dashboard-main")) {
        new DashboardPage()
    }
})
