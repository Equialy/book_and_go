// Пример API вызова
// Конфигурация API
const API_CONFIG = {
    BASE_URL: "http://localhost:8000", // Замените на URL вашего FastAPI сервера
    ENDPOINTS: {
        APPOINTMENTS: "/api/v1/panel/appointments",
        LOGIN: "/api/v1/login",
        REGISTER: "/api/v1/register",
        ME: "/api/v1/users/me",
    },
}

// Класс для работы с API
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`

        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
            },
        }

        // Добавляем токен авторизации если есть
        const token = localStorage.getItem("access_token")
        if (token) {
            defaultOptions.headers["Authorization"] = `Bearer ${token}`
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        }

        try {
            console.log(`Making ${config.method || "GET"} request to:`, url)
            console.log("Request config:", config)

            const response = await fetch(url, config)

            console.log("Response status:", response.status)
            console.log("Response headers:", response.headers)

            if (!response.ok) {
                let errorData = {}
                try {
                    errorData = await response.json()
                } catch (e) {
                    console.error("Failed to parse error response:", e)
                }

                const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`
                console.error("API Error:", errorMessage)
                throw new Error(errorMessage)
            }

            const data = await response.json()
            console.log("Response data:", data)
            return data
        } catch (error) {
            console.error("API request failed:", error)
            throw error
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: "GET" })
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" })
    }
}

// API методы для записей
class AppointmentsAPI {
    static async create(appointmentData) {
        console.log("Creating appointment with data:", appointmentData)

        // Подготавливаем данные согласно схеме FastAPI
        const apiData = {
            name: appointmentData.name,
            email: appointmentData.email,
            phone: appointmentData.phone,
            service: appointmentData.service,
            date: appointmentData.date,
            time: appointmentData.time,
            notes: appointmentData.notes || null,
            createdAt: new Date().toISOString(),
        }

        return ApiClient.post(API_CONFIG.ENDPOINTS.APPOINTMENTS, apiData)
    }

    static async getAll() {
        console.log("Fetching all appointments...")
        return ApiClient.get(API_CONFIG.ENDPOINTS.APPOINTMENTS)
    }

    static async delete(id) {
        console.log("Deleting appointment with id:", id)
        return ApiClient.delete(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`)
    }
}

// Утилиты для обработки ошибок API
class ApiErrorHandler {
    static getErrorMessage(error) {
        if (error.message.includes("Failed to fetch")) {
            return "Не удается подключиться к серверу. Проверьте подключение к интернету и убедитесь что FastAPI запущен."
        } else if (error.message.includes("422")) {
            return "Проверьте правильность заполнения всех полей"
        } else if (error.message.includes("400")) {
            return "Неверные данные. Проверьте введенную информацию."
        } else if (error.message.includes("500")) {
            return "Ошибка сервера. Попробуйте позже."
        } else if (error.message.includes("CORS")) {
            return "Ошибка CORS. Проверьте настройки сервера."
        } else if (error.message) {
            return error.message
        }
        return "Произошла неизвестная ошибка"
    }
}

// Экспортируем для использования в других файлах
window.ApiClient = ApiClient
window.AppointmentsAPI = AppointmentsAPI
window.ApiErrorHandler = ApiErrorHandler





// const API_BASE_URL = 'http://localhost:8000'; // URL вашего FastAPI сервера
//
// async function createAppointment(appointmentData) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/appointments`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(appointmentData)
//         });
//
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//
//         return await response.json();
//     } catch (error) {
//         console.error('Error creating appointment:', error);
//         throw error;
//     }
// }