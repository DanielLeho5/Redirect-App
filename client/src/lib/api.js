import axios from "axios"

const backendUrl = import.meta.env.VITE_BACKEND_URL

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true
})

let refreshPromise = null

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401 || originalRequest?._retry) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            if (!refreshPromise) {
                refreshPromise = axios.post(
                    backendUrl + "/api/auth/refresh-token",
                    {},
                    { withCredentials: true }
                )
            }

            const refreshResponse = await refreshPromise

            if (refreshResponse.data?.success) {
                return api(originalRequest)
            }
        } catch (refreshError) {
            return Promise.reject(refreshError)
        } finally {
            refreshPromise = null
        }

        return Promise.reject(error)
    }
)

export default api
