// Логика для страницы бронирования
class BookingPage {
    constructor() {
        this.isSubmitting = false
        this.init()
    }

    init() {
        console.log("Initializing booking page...")

        // Настройка ограничений даты
        this.setupDateConstraints()

        // Обработчик формы
        const form = document.getElementById("bookingForm")
        if (form) {
            form.addEventListener("submit", (e) => this.handleSubmit(e))
        }

        // Валидация в реальном времени
        this.setupRealTimeValidation()
    }

    setupDateConstraints() {
        const dateInput = document.getElementById("date")
        if (dateInput) {
            dateInput.min = window.DateUtils.getTodayString()
            dateInput.max = window.DateUtils.getMaxDateString()
        }
    }

    setupRealTimeValidation() {
        const emailInput = document.getElementById("email")
        if (emailInput) {
            emailInput.addEventListener("blur", () => {
                const email = emailInput.value
                if (email && !window.FormValidator.validateEmail(email)) {
                    this.showFieldError(emailInput, "Введите корректный email")
                } else {
                    this.clearFieldError(emailInput)
                }
            })
        }

        // Валидация длины полей
        const fields = [
            { id: "name", min: 3, max: 255 },
            { id: "phone", min: 3, max: 11 },
            { id: "notes", max: 255 },
        ]

        fields.forEach((field) => {
            const input = document.getElementById(field.id)
            if (input) {
                input.addEventListener("input", () => {
                    const value = input.value
                    if (field.min && value.length > 0 && value.length < field.min) {
                        this.showFieldError(input, `Минимум ${field.min} символов`)
                    } else if (field.max && value.length > field.max) {
                        this.showFieldError(input, `Максимум ${field.max} символов`)
                    } else {
                        this.clearFieldError(input)
                    }
                })
            }
        })
    }

    showFieldError(input, message) {
        this.clearFieldError(input)

        const errorDiv = document.createElement("div")
        errorDiv.className = "field-error"
        errorDiv.textContent = message

        input.parentNode.appendChild(errorDiv)
        input.classList.add("error")
    }

    clearFieldError(input) {
        const existingError = input.parentNode.querySelector(".field-error")
        if (existingError) {
            existingError.remove()
        }
        input.classList.remove("error")
    }

    async handleSubmit(event) {
        event.preventDefault()

        console.log("Form submitted")

        if (this.isSubmitting) {
            console.log("Already submitting, ignoring")
            return
        }

        this.isSubmitting = true
        const submitBtn = document.getElementById("submitBtn")

        // Показать состояние загрузки
        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.textContent = "Отправка..."
        }

        try {
            const formData = new FormData(event.target)
            const appointmentData = {
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                service: formData.get("service"),
                date: formData.get("date"),
                time: formData.get("time"),
                notes: formData.get("notes") || "",
            }

            console.log("Form data collected:", appointmentData)

            // Валидация на клиенте
            const validationErrors = window.FormValidator.validateAppointment(appointmentData)
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join("; "))
            }

            // Дополнительная валидация email
            if (!window.FormValidator.validateEmail(appointmentData.email)) {
                throw new Error("Введите корректный email адрес")
            }

            console.log("Sending appointment data to API...")

            // Отправка данных на API
            const response = await window.AppointmentsAPI.create(appointmentData)

            console.log("Appointment created successfully:", response)

            // Сохраняем также локально как backup
            window.AppointmentStorage.addAppointment({
                ...appointmentData,
                id: response.id || Date.now(),
            })

            window.Toast.show("Запись успешно создана! Мы свяжемся с вами в ближайшее время.", "success")

            // Перенаправление на страницу успеха через 2 секунды
            setTimeout(() => {
                window.location.href = "/success"
            }, 2000)
        } catch (error) {
            console.error("Error submitting form:", error)

            const errorMessage = window.ApiErrorHandler.getErrorMessage(error)
            window.Toast.show(errorMessage, "error")

            // Fallback: сохранить локально если API недоступен
            if (error.message.includes("подключиться к серверу")) {
                try {
                    const formData = new FormData(event.target)
                    const appointmentData = {
                        name: formData.get("name"),
                        email: formData.get("email"),
                        phone: formData.get("phone"),
                        service: formData.get("service"),
                        date: formData.get("date"),
                        time: formData.get("time"),
                        notes: formData.get("notes") || "",
                    }

                    window.AppointmentStorage.addAppointment(appointmentData)
                    window.Toast.show(
                        "Запись сохранена локально. Данные будут отправлены при восстановлении соединения.",
                        "success",
                    )

                    setTimeout(() => {
                        window.location.href = "/success"
                    }, 2000)
                } catch (fallbackError) {
                    console.error("Fallback save failed:", fallbackError)
                }
            }
        } finally {
            this.isSubmitting = false

            // Восстанавливаем кнопку
            if (submitBtn) {
                submitBtn.disabled = false
                submitBtn.textContent = "Записаться"
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("bookingForm")) {
        new BookingPage()
    }
})
